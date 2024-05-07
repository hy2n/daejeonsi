const fs = require('fs');
const Timetable = require('comcigan-parser');
const cron = require('node-cron');
const timetable = new Timetable();

const teachersFilePath = './data/db/teachers.json';
const runteachersJSON_SCAN = true;
const serviceSchoolname = '대덕소프트웨어마이스터고등학교';

function parser(user_grade, user_class) {
    return new Promise(async (resolve, reject) => {
        try {
            await timetable.init(); // timetable reset

            // 학교 검색 및 특정 학교 찾기
            const schoolList = await timetable.search('대덕');
            //console.log(schoolList); 학교 검색시 사용

            const targetSchool = schoolList.find((school) => {
                return school.region === '대전' && school.name === serviceSchoolname;
            });

            // 학교 설정
            await timetable.setSchool(targetSchool.code);
            const result = await timetable.getTimetable();

            // result[학년][반][요일][교시]
            // 요일: (월: 0 ~ 금: 4)
            // 교시: 1교시(0), 2교시(1), 3교시(2)~ 7교시(8)

            resolve(result[user_grade][user_class]);
        } catch (error) {
            reject(error);
        }
    });
}

function createTeachersInfo(result) {
    const teachersInfo = {};

    // Loop through each class in the result
    for (let day = 0; day < 5; day++) {
        for (let hour = 0; hour < 8; hour++) {
            const classInfo = result[day][hour];
            const classId = classInfo.classid;

            // If classid is not empty and not already in teachersInfo, add it
            if (classId !== '' && !teachersInfo.hasOwnProperty(classId)) {
                const subject = classId.substring(0, 2);
                const teacher = classId.substring(2);
                teachersInfo[classId] = {
                    "InterTeacher": teacher,
                    "TeacherRoom": "unknown",
                    "Subject": subject
                };
            }
        }
    }

    return teachersInfo;
}

function updateTeachersJSON(teachersInfo) {
    let teachersJSON = {};
    try {
        teachersJSON = JSON.parse(fs.readFileSync(teachersFilePath, 'utf8'));
    } catch (error) {
        // If the file doesn't exist or is invalid JSON, start with an empty object
        console.error('Error reading or parsing teachers JSON file:', error);
    }

    // Merge teachersInfo into teachersJSON, but only if the key doesn't already exist
    for (const [key, value] of Object.entries(teachersInfo)) {
        if (!teachersJSON.hasOwnProperty(key)) {
            teachersJSON[key] = value;
        }
    }

    // Write updated JSON back to file
    fs.writeFileSync(teachersFilePath, JSON.stringify(teachersJSON, null, 2));
}
function createTimetable(result, grade, classNum) {
    const timetable = {};
    const movedTimetable = {};

    // 각 요일별로 초기화
    for (let day = 0; day < 5; day++) { // 월화수목금(0,1,2,3,4)
        timetable[day] = [];
        movedTimetable[day] = [];
        for (let hour = 0; hour < 8; hour++) { // 1교시(0) ~ 7교시(7)
            timetable[day].push(result[day][hour]);
            if (result[day][hour].moved && result[day][hour].classid !== '') { // moved:true 이고 classid가 비어있지 않은 경우에만 추가
                movedTimetable[day].push(result[day][hour]);
            }
        }
    }

    // JSON 파일로 저장
    const timetableJSON = JSON.stringify(timetable, null, 2);
    fs.writeFileSync(`./data/tables/${grade}-${classNum}.json`, timetableJSON);

    const movedTimetableJSON = JSON.stringify(movedTimetable, null, 2);
    fs.writeFileSync(`./data/tables/${grade}-${classNum}-moved.json`, movedTimetableJSON);

    if (runteachersJSON_SCAN) { //선생님 스캔 활성화된 경우에만 선생님 정보 추가
        const teachersInfo = createTeachersInfo(result);
        updateTeachersJSON(teachersInfo);
        console.log("[안내] 최초 선생님 DB등록을 마쳤습니다. 서버에 상당한 부하가 가므로 옵션을 비활성화 해주십시오.")
    }
    console.log("[안내] " + grade + "학년" + classNum + "반 데이터 파싱 완료!")
}


function parse_table(gra, cla) {
    parser(gra, cla)
        .then(result => createTimetable(result, gra, cla))
        .catch(error => console.error('Error:', error));
}

parseFunction(); //서버 파싱은 잠깐 끔
// Cron 작업 설정
cron.schedule('0 6,12,15,20 * * 1-5', () => { // 평일 6시/12시/15시/20시에 파싱 진행
    // 실행할 함수
    parseFunction();
}, {
    scheduled: true,
    timezone: "Asia/Seoul" // 해당 지역의 시간대에 맞게 설정하세요.
});

function parseFunction() {
    parse_table(1, 4);
    parse_table(1, 3);
    parse_table(1, 2);
    parse_table(1, 1);
}


