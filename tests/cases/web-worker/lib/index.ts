onmessage = (evt) => {
  if (evt.data.cmd === "read") {
    let reader = new FileReaderSync();
    let file: File = evt.data.file;
    let data = reader.readAsArrayBuffer(file);
    postMessage({ cmd: "data", data }, [ data ]);
  }
};

onerror = (evt) => {
  postMessage({ cmd: "error", error: evt.error });
};
