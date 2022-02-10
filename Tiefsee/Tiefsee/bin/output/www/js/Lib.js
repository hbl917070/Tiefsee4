var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
const _Lib = class {
  static addEventDblclick(dom, func, dealy = 400) {
    var clickTimeout = -1;
    var _x = 0;
    var _y = 0;
    dom.addEventListener("mousedown", (e) => __async(this, null, function* () {
      if (e.button !== 0) {
        return;
      }
      if (clickTimeout !== -1) {
        clearTimeout(clickTimeout);
        clickTimeout = -1;
        if (Math.abs(_x - e.offsetX) < 4 && Math.abs(_y - e.offsetY) < 4) {
          func(e);
        }
      } else {
        _x = e.offsetX;
        _y = e.offsetY;
        clickTimeout = setTimeout(function() {
          clickTimeout = -1;
        }, dealy);
      }
    }));
  }
  static GetFileInfo2(path) {
    return __async(this, null, function* () {
      let s = yield WV_File.GetFileInfo2(path);
      let json = JSON.parse(s);
      return json;
    });
  }
  static IsAnimation(fileInfo2) {
    let hex = fileInfo2.HexValue;
    if (_Lib.GetExtension(fileInfo2.Path) === ".svg") {
      return true;
    }
    if (hex.indexOf("47 49 46 38 39 61") === 0) {
      return true;
    }
    if (hex.indexOf("89 50 4E 47 0D 0A 1A 0A") === 0) {
      if (hex.indexOf("08 61 63 54") > 10) {
        return true;
      }
    }
    if (hex.indexOf("57 45 42 50 56 50 38 58 0A") > 0) {
      return true;
    }
    return false;
  }
  static GetFileType(fileInfo2) {
    let fileExt = _Lib.GetExtension(fileInfo2.Path);
    fileExt = fileExt.replace(".", "").toLocaleLowerCase();
    let hex = fileInfo2.HexValue;
    if (hex.indexOf("FF D8 FF") === 0) {
      return "jpg";
    }
    if (hex.indexOf("42 4D") === 0 && hex.length > 30 && hex.substr(18, 11) === "00 00 00 00") {
      return "bmp";
    }
    if (hex.indexOf("47 49 46 38") === 0) {
      return "gif";
    }
    if (hex.indexOf("89 50 4E 47 0D 0A 1A 0A") === 0) {
      if (hex.indexOf("08 61 63 54") > 10) {
        return "apng";
      } else {
        return "png";
      }
    }
    if (hex.indexOf("57 45 42 50 56 50 38 58 0A") > 0) {
      return "webp";
    }
    if (hex.indexOf("57 45 42 50 56 50 38") > 0) {
      return "webp";
    }
    if (hex.indexOf("6D 69 6D 65 74 79 70 65 61 70 70 6C 69 63 61 74 69 6F 6E 2F 76 6E 64 2E 61 64 6F 62 65 2E 73 70 61 72 6B 6C 65 72 2E 70 72 6F 6A 65 63 74 2B 64 63 78 75 63 66 50 4B") > 0) {
      return "xd";
    }
    if (hex.indexOf("25 50 44 46") === 0) {
      if (fileExt === "ai") {
        return "ai";
      }
      return "pdf";
    }
    if (hex.indexOf("4C 00 00 00 01 14 02 00") === 0) {
      return "lnk";
    }
    console.log("\u6A94\u6848\u985E\u578B\u8FA8\u8B58\u5931\u6557: " + fileInfo2.Path);
    console.log(hex);
    return fileExt;
  }
};
let Lib = _Lib;
Lib.GetFileName = (path) => {
  path = path.replace(/[/]/ig, "\\");
  let name = path.substr(path.lastIndexOf("\\") + 1);
  return name;
};
Lib.GetExtension = (path) => {
  path = path.replace(/[/]/ig, "\\");
  let name = path.substr(path.lastIndexOf("\\") + 1);
  let index = name.lastIndexOf(".");
  if (index === -1) {
    return "";
  }
  return "." + name.substr(index + 1).toLocaleLowerCase();
};
Lib.Combine = (arPath) => {
  if (arPath.length === 0) {
    return "";
  }
  if (arPath.length === 1) {
    return arPath[0];
  }
  let sum = arPath[0];
  sum = sum.replace(/[\\]+$/, "");
  sum += "\\";
  for (let i = 1; i < arPath.length; i++) {
    let item = arPath[i];
    item = item.replace(/^([\\])+/, "");
    item = item.replace(/[\\]+$/, "");
    sum += item;
    if (i != arPath.length - 1) {
      sum += "\\";
    }
  }
  return sum;
};
function initDomImport() {
  return __async(this, null, function* () {
    let ar_dom = document.querySelectorAll("import");
    for (let i = 0; i < ar_dom.length; i++) {
      const _dom = ar_dom[i];
      let src = _dom.getAttribute("src");
      if (src != null)
        yield fetch(src, {
          "method": "get"
        }).then((response) => {
          return response.text();
        }).then((html) => {
          _dom.outerHTML = html;
        }).catch((err) => {
          console.log("error: ", err);
        });
    }
  });
}
function readFile(url) {
  return __async(this, null, function* () {
    let txt = "";
    yield fetch(url, {
      "method": "get"
    }).then((response) => {
      return response.text();
    }).then((html) => {
      txt = html;
    }).catch((err) => {
      console.log("error: ", err);
    });
    return txt;
  });
}
function newDiv(html) {
  let div = document.createElement("div");
  div.innerHTML = html;
  return div.getElementsByTagName("div")[0];
}
function sleep(ms) {
  return __async(this, null, function* () {
    yield new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve(0);
      }, ms);
    });
  });
}
function toNumber(t) {
  if (typeof t === "number") {
    return t;
  }
  if (typeof t === "string") {
    return Number(t.replace("px", ""));
  }
  return 0;
}
Date.prototype.format = function(format) {
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds()
  };
  if (/(y+)/.test(format))
    format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(format))
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  return format;
};
function getRadio(queryName) {
  return $(`${queryName}:checked`).val() + "";
}
function setRadio(queryName, value) {
  $(`${queryName}[value='${value}']`).prop("checked", true);
}
