const formatList = {
    json: {
        name: 'JSON',
        input: null,
        output: (data) => { return JSON.stringify(data) }
    },
    spreadsheet: {
        name: 'スプレッドシート',
        input: inputSpreadsheet,
        output: outputSpreadsheet
    },
    hosts: {
        name: 'hosts',
        input: null,
        output: outputHosts
    },
    unbound: {
        name: 'unbound',
        input: null,
        output: outputUnbound,
        outOption: '#outopt-unbound'
    },
    ix: {
        name: 'IX',
        input: null,
        output: outputIX,
        outOption: '#outopt-ix'
    }
};

$(() => {
    Object.entries(formatList).forEach(format => {
        const option = $('<option></option>', { value: format[0], text: format[1].name });
        if (format[1].input) $('select#input-format').append(option.clone());
        if (format[1].output) $('select#output-format').append(option.clone());
    });

    $('#output-format').change(() => {
        $('.output-option').hide();
        const format = $('#output-format').val();
        if (formatList[format].outOption) {
            $(formatList[format].outOption).show();
        }
    })

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

function inputSpreadsheet(str) {
    return str.split(/\r\n|\n/)
        .map(line => line.split('\t'))
        .map(v => ({ domain: v[0], ipv4: v[1], ipv6: v[2] }))
        .filter(v => (checkDomain(v.domain)) && (checkIPv4(v.ipv4) || v.ipv4 === '') && (checkIPv6(v.ipv6) || v.ipv6 === '') && (v.ipv4 != v.ipv6));
}

function outputSpreadsheet(data) {
    return data.reduce((acc, v) => acc + (v.domain + '\t' + v.ipv4 + '\t' + v.ipv6 + '\n'), '');
}

function outputHosts(data) {
    return data.filter(v => v.ipv4 != '')
        .reduce((acc, v) => acc + (v.ipv4 + '\t' + v.domain + '\n'), '')
        + '\n' +
        data.filter(v => v.ipv6 != '')
            .reduce((acc, v) => acc + (v.ipv6 + '\t' + v.domain + '\n'), '');
}

function outputUnbound(data) {
    const indentList = {
        none: '',
        tab: '\t',
        space2: '  ',
        space4: '    ',
    };

    const indent = indentList[$('#unbound-indent').val()] || '';
    //const ttl = $('#unbound-ttl').val();
    const reverse = $('#unbound-reverse').prop("checked");
    console.log(data);
    let output = data.reduce((acc, v) => (
        acc + (v.ipv4 ? (indent + 'local-data: \"' + v.domain + '. IN A ' + v.ipv4 + '\"\n') : '')
        + (v.ipv6 ? (indent + 'local-data: \"' + v.domain + '. IN AAAA ' + v.ipv6 + '\"\n') : '')
    ), '');
    if (reverse) {
        output += '\n'
            + data.filter(v => v.ipv4)
                .reduce((acc, v) => (acc + indent + 'local-data-ptr: \"' + v.ipv4 + ' ' + v.domain + '.\"\n'), '')
            + data.filter(v => v.ipv6)
                .reduce((acc, v) => (acc + indent + 'local-data-ptr: \"' + v.ipv6 + ' ' + v.domain + '.\"\n'), '');
    }
    return output;
}

function outputIX(data) {
    const cmdIP = $('#ix-ip').val();
    const ipv4 = (cmdIP === 'both' || cmdIP === 'ipv4');
    const ipv6 = (cmdIP === 'both' || cmdIP === 'ipv6');
    const pre = 'dns host ';

    return data.reduce((acc, v) => (
        acc +
        (ipv4 ? (
            (v.ipv4 ? (pre + v.domain + ' ip ' + v.ipv4 + '\n') : '') +
            (v.ipv6 ? (pre + v.domain + ' ip ' + v.ipv6 + '\n') : '')
        ) : '') +
        (ipv6 ? (
            (v.ipv4 ? (pre + v.domain + ' ipv6 ' + v.ipv4 + '\n') : '') +
            (v.ipv6 ? (pre + v.domain + ' ipv6 ' + v.ipv6 + '\n') : '')
        ) : '')
    ), '');
}