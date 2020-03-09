async function f(url) {
  fetch(url)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      return json;
    })
    .then(json => (document.getElementById("out").innerHTML = JSON.stringify(json)));
}
