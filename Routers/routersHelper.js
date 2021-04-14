module.exports = () => {
    return {
        dateRegExp: dateRegExp,
        parseNumberWithDefault: parseNumberWithDefault,
        parseStringToDates: parseStringToDates,
        parseStringToTeachers: parseStringToTeachers,
    };
}

const dateRegExp = new RegExp(/(\d{4})-(\d{2})-(\d{2})/);

function parseNumberWithDefault(sourceValue, defaultValue) {
    let parseValue = Number(sourceValue);
    if (parseValue === 0 && sourceValue === '') {
        return defaultValue;
    }
    return (Number.isNaN(parseValue)) ? defaultValue : parseValue;
}

function parseStringToDates(dateString) {
    let dates = dateString.split(',');
    for (let i = 0; i < dates.length;) {
        const date = dates[i];
        if (dateRegExp.test(date) !== true) {
            dates.splice(i, 1);
        }
        else {
            i++;
        }
    }
    return dates;
}

function parseStringToTeachers(teachersString) {
    let teacherIds = undefined;
    if (teachersString !== undefined && teachersString !== '') {
        teacherIds = teachersString.split(',');
        for (let i = 0; i < teacherIds.length;) {
            const id = Number(teacherIds[i]);
            if (Number.isNaN(id)) {
                teacherIds.splice(i, 1);
            }
            else {
                teacherIds[i] = id;
                i++;
            }
        }
        if (teacherIds.length === 0) {
            teacherIds = undefined;
        }
    }
    return teacherIds;
}