// Функция для включения содержимого других HTML-файлов
function w3IncludeHTML() {
  var z, i, a, file, xhttp;
  // Получение всех элементов на странице
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    // Проверка наличия атрибута w3-include-html
    if (z[i].getAttribute("w3-include-html")) {
      a = z[i].cloneNode(false);
      file = z[i].getAttribute("w3-include-html");
      // Создание объекта XMLHttpRequest для запроса содержимого файла
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          a.removeAttribute("w3-include-html");
          // Вставка содержимого файла в копию элемента
          a.innerHTML = xhttp.responseText;
          // Замена исходного элемента на странице копией с включенным контентом
          z[i].parentNode.replaceChild(a, z[i]);
        }
      };
      // Отправка запроса на сервер для получения содержимого файла
      xhttp.open("GET", file, true);
      xhttp.send();
    }
  }
}