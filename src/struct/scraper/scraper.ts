import FormData from 'form-data';
import axios from 'axios';
import { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import fs from 'fs';
import { load } from 'cheerio';
import { SubjectData, TerminData } from 'vut-scraper';
import { ScraperCore } from './client';
import hash from 'hash-it';

export const login = async (
  scrapper: ScraperCore,
) => {
  try {
    if (!scrapper.scrapperClient) {
      const jar = new CookieJar();
      scrapper.scrapperClient = wrapper(axios.create({ jar, withCredentials: true }));
    }

    const initResponse = await scrapper.scrapperClient.get(
      'https://www.vut.cz/en/login/login'
    );

    const fdkey = initResponse.data.match(
      /<input type="hidden" name="sv\[fdkey\]" value="(.*)">/
    )[1];

    const form = new FormData();
    form.append('special_p4_form', 1);
    form.append('login_form', 1);
    form.append('sentTime', Date.now());
    form.append('sv[fdkey]', fdkey);
    form.append('LDAPlogin', scrapper.client.config.credentials.username);
    form.append('LDAPpasswd', scrapper.client.config.credentials.password);
    form.append('login', '');

    const loginResp = await scrapper.scrapperClient.post('https://www.vut.cz/login/in', form, {
      headers: form.getHeaders()
    });

    const root = load(loginResp.data);
    const text = root('.alert-text').text().toLowerCase();
    if (text.includes('nesprávný' || 'wrong')) {
      scrapper.client.logger.error('Wrong login credentials');
      scrapper.client.destroy();
      process.exit(1);
    }
  } catch (error) {
    console.log('error', error);
  }
};

export const logout = async (scrapperClient: AxiosInstance) => {
  await scrapperClient.get('https://www.vut.cz/login/out');
};

export const scrape = async (scrapperClient: AxiosInstance): Promise<Array<SubjectData>> => {
  const response = await scrapperClient.get(
    'https://www.vut.cz/studis/student.phtml?sn=terminy_zk'
  );
  fs.writeFileSync('terms.html', response.data);
  const root = load(response.data);

  const returnData: Array<SubjectData> = [];

  const subjects = root('.m_ppzc');

  subjects.each((i, el) => {
      
    const title = root(el).find('.m_nadpis').text();

    const termins = root(el).find(
      '.m_termin.m_tsner_zje, .m_termin.m_tsreg_zr'
    );
    const termsDataArray: Array<TerminData> = [];
    termins.each((i, el) => {

      const reg = root(el)
        .find('.m_tinfo')
        .contents()
        .filter((i, el) => el.type === 'text')
        .text()
        .split('\n');
      const num = extractReg(reg);

      root(el)
        .find('.m_tinfo .m_nespl_pod')
        .each((i, el) => {
          const text = root(el).text();
          if (text && text !== '') {
            num[i] = text;
          }
        });

      const tempNote = root(el).find('.m_tinfo .m_pozn').text()

      const terminData: TerminData = {
        termin: root(el).find('span.hlavni').text(),
        type: cleanType(
          root(el)
            .find('.m_podnadpis')
            .contents()
            .filter((i, el) => el.type === 'text')
            .text()
        ),
        registered: reg[0].split(' ')[0] === 'registrován' ? true : false,
        registeredNote: reg[0].split(' - ')[1] ? reg[0].split(' - ')[1] : null,
        note: tempNote ? tempNote : null,
        examiner: root(el).find('.m_tinfo a').text(),
        examinerLink:
          'https://www.vut.cz' + root(el).find('.m_tinfo a').attr('href'),
        room: root(el).find('.bs_ttip').text(),
        spots: {
          taken: Number(num[0]),
          total: isNaN(Number(num[1])) ? 9999 : Number(num[1]),
          free: isNaN(Number(num[1])) ? 9999 : Number(num[1]) - Number(num[0])
        },
        filled: num[0] === num[1] ? true : false,
        onlyExamStudents: reg[2].split(': ')[1] === 'ano' ? true : false,
        title: title,
        hash: hash(`${root(el).find('span.hlavni').text()},${root(el).find('.m_tinfo a').text()},${tempNote ? tempNote : ''}`),
      };
      termsDataArray.push(terminData);
    });

    returnData.push({
      title: title,
      terms: termsDataArray
    });
  });
  return returnData;
};

function cleanType(string: string) {
  if (string.startsWith(' - ')) {
    string = string.substring(3);
  }
  if (
    string.endsWith(' - detail, odhlásit') ||
    string.endsWith(' - detail, přihlásit')
  ) {
    string = string.substring(0, string.length - 19);
  }
  return string;
}

function extractReg(arr: Array<string>) {
  let num = arr[1].replace(/\s/g, '');
  num = num.split(':').pop();
  return num.split('/');
}
