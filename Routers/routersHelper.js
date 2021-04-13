module.exports = () => {
    return {
        dateRegExp: new RegExp(/(\d{4})-(\d{2})-(\d{2})/),
        parseNumberWithDefault: parseNumberWithDefault,
    };
}

function parseNumberWithDefault(sourceValue, defaultValue) {
    let parseValue = Number(sourceValue);
    if (parseValue === 0 && sourceValue === '') {
        return defaultValue;
    }
    return (Number.isNaN(parseValue)) ? defaultValue : parseValue;
}
