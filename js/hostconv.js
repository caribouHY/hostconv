const formatList = {
    json: {
        name: 'JSON',
        input: null,
        output: (data) => { return JSON.stringify(data) }
    },
    spreadsheet: {
        name: 'スプレッドシート',
        input: inputSpretsheet,
        output: null
    },
    hosts: {
        name: 'hosts',
        input: null,
        output: null
    },
};

$(() => {
    Object.entries(formatList).forEach(format => {
        const option = $('<option></option>', { value: format[0], text: format[1].name });
        if (format[1].input) $('select#input-format').append(option);
        if (format[1].output) $('select#output-format').append(option);
    });

    $('button#translate').click(translate);
})

function checkDomain(domain) {
    const regex = /^([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
    return regex.test(domain);
}

function checkIPv4(ipv4) {
    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ipv4);
}

function checkIPv6(ipv6) {
    const regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
    return regex.test(ipv6);
}

function translate() {
    const inputText = $('textarea#input-text').val();
    const inputFormat = $('#input-format').val();
    const outputFormat = $('#output-format').val();

    if (inputFormat in formatList && formatList[inputFormat].input &&
        outputFormat in formatList && formatList[outputFormat].output) {
        const data = formatList[inputFormat].input(inputText);
        const outputText = formatList[outputFormat].output(data);
        $('textarea#output-text').val(outputText);
    }
}

function inputSpretsheet(str) {
    return str.split(/\r\n|\n/)
        .map(line => line.split('\t'))
        .map(v => ({ domain: v[0], ipv4: v[1], ipv6: v[2] }))
        .filter(v => (checkDomain(v.domain)) && (checkIPv4(v.ipv4) || v.ipv4 === '') && (checkIPv6(v.ipv6) || v.ipv6 === '') && (v.ipv4 != v.ipv6));
}