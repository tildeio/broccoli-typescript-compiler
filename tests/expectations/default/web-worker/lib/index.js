onmessage = function (evt) {
    if (evt.data.cmd === "read") {
        var reader = new FileReaderSync();
        var file = evt.data.file;
        var data = reader.readAsArrayBuffer(file);
        postMessage({ cmd: "data", data: data }, [data]);
    }
};
onerror = function (evt) {
    postMessage({ cmd: "error", error: evt.error });
};
