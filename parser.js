const fs = require('fs');
const Timetable = require('comcigan-parser');
const cron = require('node-cron');
const timetable = new Timetable();

const teachersFilePath = './data/db/teachers.json';
const runteachersJSON_SCAN = false;
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
    try {
        const timetable = {};
        const movedTimetable = {};
        
        const createNoClassDay = () => {
            const noClassDay = [];
            for (let hour = 0; hour < 8; hour++) {
                noClassDay.push({ classid: '', moved: false, subject: '수업 없음' });
            }
            return noClassDay;
        };
        
        for (let day = 0; day < 7; day++) { // Monday to Sunday (0-6)
            if (day < 5) { // Monday to Friday
                timetable[day] = [];
                movedTimetable[day] = [];
                
                for (let hour = 0; hour < 8; hour++) { // 1st to 8th period (0-7)
                    timetable[day].push(result[day][hour]);
                    
                    if (result[day][hour].moved && result[day][hour].classid !== '') { 
                        movedTimetable[day].push(result[day][hour]);
                    }
                }
            } else { 
                timetable[day] = createNoClassDay();
                movedTimetable[day] = []; 
            }
        }
        fs.writeFileSync(`./data/tables/${grade}-${classNum}.json`, JSON.stringify(timetable, null, 2), 'utf8');
        
        fs.writeFileSync(`./data/tables/${grade}-${classNum}-moved.json`, JSON.stringify(movedTimetable, null, 2), 'utf8');
        if (runteachersJSON_SCAN) {
            const teachersInfo = createTeachersInfo(result);
            updateTeachersJSON(teachersInfo);
            console.log("[안내] 최초 선생님 DB등록을 마쳤습니다. 서버에 상당한 부하가 가므로 옵션을 비활성화 해주십시오.");
        }
        
        console.log(`[ ${new Date().toLocaleString()} ] ${grade}학년 ${classNum}반 데이터 파싱 완료!`);
    } catch (error) {
        console.error("Error creating timetable:", error);
    }
}


function parse_table(gra, cla) {
    parser(gra, cla)
        .then(result => createTimetable(result, gra, cla))
        .catch(error => console.error('Error:', error));
}

parseFunction();//테스트용
// Cron 작업 설정
cron.schedule('0 6,12,15,20 * * 1-5', () => { // 평일 6시/12시/15시/20시에 파싱 진행
    // 실행할 함수
    parseFunction();
}, {
    scheduled: true,
    timezone: "Asia/Seoul" 
});

function parseFunction() {
    parse_table(1, 4);
    parse_table(1, 3);
    parse_table(1, 2);
    parse_table(1, 1);
}


