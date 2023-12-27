const saveReportToFile = async (trainReport: any) => {
    // Default options are marked with *
    const response = await fetch('http://127.0.0.1:8000', {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(trainReport), // body data type must match "Content-Type" header
    });
    return response.statusText;
};

const loadAndParseReportFromFile = async () => {
    const { data, error } = await loadReportFromFile();
    const { startDate, endDate, trainText } = data || {};
    const exercisesList = trainText.split('\n');
    return {
        data: {
            exercisesList,
            startDate: new Date(startDate).toLocaleTimeString('ru-RU'),
            endDate: new Date(endDate).toLocaleDateString('ru-RU'),
        },
        error
    };
};

const loadReportFromFile = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/latest');
        const data = await response.json();
        return { data };
    } catch (error) {
        return { error };
    }
};

export { saveReportToFile, loadReportFromFile, loadAndParseReportFromFile };
