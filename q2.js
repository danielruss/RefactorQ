const questionIdRegex = /\[([A-Z_][A-Z0-9_#]*[\?\!]?)(,.*?)?\](.*?)(?=$|\[[_A-Z])/gs;
const radioButtonRegex = /(?<=\W)\((\d+)(?:\:(\w+))?\)([^<\n]*)|\(\)/g;
const checkBoxRegex = /\s*\[(\w*)(?:\:(\w+))?(?:,displayif=(.*?))?\]([^<\n]*)/g;
const inputNumberRegex = /\|(?:__\|){2,}((\w+)\|)?/g;
const inputTextRegex = /(?:\[text\s?box(?:\s*:\s*(\w+))?\]|\|__\|(?:(\w+)?\|)?)(?:(.*?))/g;

function render(txt) {
  // identify all the question...
  let res = [...txt.matchAll(questionIdRegex)].map(x => ({ rawText: x[0], id: x[1], arg: x[2], questionText: x[3] }));

  // add the questions to localstorage...
  res.map(questionObj => localforage.setItem(questionObj.id, questionObj.questionText));
  res = res.map(questionObj => renderQuestion(questionObj)).join("\n");

  document.querySelector("#convert").innerHTML = res;
}

function renderQuestion(questionObj) {
  let args = questionObj.arg ? questionObj.arg : "";
  handleRadioButton(questionObj);
  handleCheckBoxes(questionObj);
  handleOtherInput(questionObj, "number");
  handleOtherInput(questionObj, "text");
  let questionText = '<form id="' + questionObj.id + '" ' + args + ">" + questionObj.questionText.trim() + "</form>";

  return questionText;
}

function handleRadioButton(obj) {
  obj.questionText = obj.questionText.replace(radioButtonRegex, (responseTxt, responseValue, responseId, responseLabel) => {
    responseId = responseId ? responseId : obj.id + "_rb_" + responseValue;
    return (
      '<div class="response"><input type="radio" id="' +
      responseId +
      '" name="' +
      obj.id +
      '_rb"><label for=' +
      responseId +
      ">" +
      responseLabel +
      "</label></div>"
    );
  });
}

function handleCheckBoxes(obj) {
  obj.questionText = obj.questionText.replace(checkBoxRegex, (responseTxt, responseValue, responseId, args, responseLabel) => {
    responseId = responseId ? responseId : obj.id + "_cb_" + responseValue;
    return (
      '<div class="response"><input type="checkbox" id="' +
      responseId +
      '" name="' +
      obj.id +
      '_cb" value="' +
      responseValue +
      '"><label for=' +
      responseId +
      ">" +
      responseLabel +
      "</label></div>"
    );
  });
}

function handleOtherInput(obj, inputType) {
  const regexPattern = {
    text: inputTextRegex,
    number: inputNumberRegex
  };

  if (!regexPattern.hasOwnProperty(inputType)) {
    console.log("can't handle " + inputType);
    return;
  }

  obj.questionText = obj.questionText.replace(regexPattern[inputType], (responseText, variableName) => {
    return (
      '<div class="response"><input type="' + inputType + '" name="' + (variableName ? variableName : obj.id) + '"></input></div>'
    );
  });
}

function f() {
  // first get the text and fill out the
  loadTxt()
    .then(txt => {
      document.querySelector("#raw").innerText = txt;
      return txt;
    })
    .then(txt => render(txt));
}

function loadTxt() {
  if (document.querySelector("#url").value.length == 0) {
    console.log("no questionnaire URL given");
    return "";
  } else {
    url = document.querySelector("#url").value;
    let txt = fetch(url)
      .then(response => response.text())
      .then(data => {
        console.log(data);
        return data;
      });
    return txt;
  }
}
