const Timetable = require('comcigan-parser');
const timetable = new Timetable();

const test = async () => {
  await timetable.init();// timetable reset

  // 학교 검색 및 특정 학교 찾기
  const schoolList = await timetable.search('대덕');
  //console.log(schoolList); 학교 검색시 사용

  const targetSchool = schoolList.find((school) => {
    return school.region === '대전' && school.name === '대덕소프트웨어마이스터고등학교';
  });

  // 학교 설정
  await timetable.setSchool(targetSchool.code);
  const result = await timetable.getTimetable();

  // result[학년][반][요일][교시]
  // 요일: (월: 0 ~ 금: 4)
  // 교시: 1교시(0), 2교시(1), 3교시(2)..
  // 2학년 4반 화요일 3교시 시간표
  console.log(result[1][4][3][3]);
  //console.log(result[1][4][1][2].teacher);

  /*for (let m = 0; m < 5;) {
    console.log(m+"st log ==============")
    for (var x = 0; x < 8;) {
      console.log(result[1][4][m][x].subject);
      x++;
    }
    m++;
  }*/
};

test();