// node_modules/fsp-xml-parser/dist/esm/parser.js
function parse(xml, withNS) {
  xml = xml.trim();
  xml = xml.replace(/<!--[\s\S]*?-->/g, "");
  let doc = {
    declaration: undefined,
    root: undefined
  };
  doc.declaration = declaration();
  let m = xml.match(/<!\[CDATA\[[\s\S]*?\]\]>/gm);
  if (m) {
    for (let str of m) {
      xml = xml.replace(str, encodeCDATA(str));
    }
  }
  let parsed = parseAll(xml);
  if (parsed) {
    if (parsed.children.length === 1 && typeof parsed.children[0] !== "string")
      doc.root = parsed.children[0];
    else
      throw new Error("XML\u6E90\u7801\u4E0D\u7B26\u5408\u89C4\u8303\uFF1A\u6709\u4E0D\u6B621\u4E2A\u6839\u8282\u70B9");
  }
  if (doc.root && withNS === true)
    applyNS(doc.root);
  return doc;
  function encodeCDATA(str) {
    let shadow = str.split(`<![CDATA[`)[1].split(`]]>`)[0].replace(/</, `[_*[\$(<)\$]*_]`).replace(/>/, `[_*[\$(>)\$]*_]`).replace(/\//, `[_*[\$(/)\$]*_]`).replace(/\\/, `[_*[\$(LS)\$]*_]`);
    return `<![CDATA[${shadow}]]>`;
  }
  function decodeCDATA(str) {
    let m2 = str.match(/<!\[CDATA\[[\s\S]*?\]\]>/gm);
    if (m2) {
      for (let cdata of m2) {
        let shadow = cdata.split(`<![CDATA[`)[1].split(`]]>`)[0].replace(/\[_\*\[\$\(<\)\$\]\*\_]/, `<`).replace(/\[_\*\[\$\(>\)\$\]\*_]/, `>`).replace(/\[_\*\[\$\(\/\)\$\]\*_]/, `/`).replace(/\[_\*\[\$\(LS\)\$\]\*_]/, `\\`);
        str = str.replace(cdata, `<![CDATA[${shadow}]]>`);
      }
    }
    return str;
  }
  function declaration() {
    let temp = "";
    let m2 = xml.match(/^<\?xml[\s\S]*\?>/m);
    if (!m2)
      return;
    else {
      temp = m2[0];
      xml = xml.slice(temp.length);
    }
    let node = {
      name: ""
    };
    getAttributes(temp, node);
    if (node.attributes)
      return {
        attributes: node.attributes
      };
    return;
  }
  function parseAll(str) {
    let all = [];
    let loop = true;
    while (loop) {
      let firstTag = getFirstTag(str);
      if (!firstTag)
        loop = false;
      else {
        let targetStr = "";
        let node = undefined;
        if (firstTag.type === "selfClose") {
          targetStr = firstTag.str;
          node = parseNode(targetStr, firstTag.name, true);
        }
        if (firstTag.type === "normal") {
          targetStr = firstTag.strs["outer"];
          node = parseNode(firstTag.strs, firstTag.name, false);
        }
        if (node)
          all.push(node);
        str = str.replace(targetStr, "");
      }
    }
    str = str.replace(/[\r\n]/g, "").trim();
    if (all.length === 0)
      return;
    else
      return {
        children: all,
        strLeft: str
      };
  }
  function parseNode(target, tagName, isSelfClose) {
    let node = {
      name: tagName
    };
    if (isSelfClose === true) {
      parseSelfCloseTag(target, node);
    } else {
      parseNormalTag(target, node);
    }
    return node;
  }
  function parseSelfCloseTag(str, node) {
    getAttributes(str, node);
  }
  function parseNormalTag(strs, node) {
    getAttributes(strs["attrs"], node);
    let str = strs["inner"];
    if (str.match(/<(?<tag>[\w:]+)([^<^>])*?\/>/m) || str.match(/<(?<tag>[\w:]+)[\s\S]*?>[\s\S]*?<\/\k<tag>*?>/m)) {
      let res = parseAll(str);
      if (res) {
        if (res.children && res.children.length > 0)
          node.children = res.children;
        if (res.strLeft !== "") {
          res.strLeft = res.strLeft.replace(/[\r\n]/g, "").trim();
          node.content = decodeCDATA(res.strLeft);
        }
      }
    } else {
      if (str !== "") {
        str = str.replace(/[\r\n]/g, "").trim();
        node.content = decodeCDATA(str);
      }
    }
  }
  function getFirstTag(str) {
    let m2 = str.match(/<([\w-:.]+)\s*/m);
    if (!m2)
      return;
    else {
      let tagName = m2[1];
      let selfCloseStr = getSelfCloseNode(str, tagName);
      if (selfCloseStr) {
        return {
          type: "selfClose",
          name: tagName,
          str: selfCloseStr
        };
      }
      let normalStr = getNormalNode(str, tagName);
      if (normalStr) {
        return {
          type: "normal",
          name: tagName,
          strs: normalStr
        };
      }
      return;
    }
  }
  function getSelfCloseNode(str, tagName) {
    let reg = new RegExp(`<${tagName}[^<^>]*?/>`, "m");
    let m2 = str.match(reg);
    if (!m2)
      return;
    else
      return m2[0];
  }
  function getNormalNode(str, tagName) {
    let reg = new RegExp(`<${tagName}([\\s\\S]*?)>([\\s\\S]*?)</${tagName}>`, "gm");
    let m2 = reg.exec(str);
    if (!m2)
      return;
    else
      return {
        outer: m2[0],
        attrs: m2[1],
        inner: m2[2]
      };
  }
  function getAttributes(str, node) {
    let loop = true;
    while (loop) {
      let m2 = str.match(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/);
      if (!m2)
        loop = false;
      else {
        if (!node.attributes)
          node.attributes = {};
        node.attributes[m2[1]] = strip(m2[2]);
        str = str.replace(m2[0], "");
      }
    }
  }
  function strip(val) {
    return val.replace(/^['"]|['"]$/g, "");
  }
  function applyNS(node, ns) {
    let nsMap = {};
    if (ns) {
      for (let key of Object.keys(ns)) {
        nsMap[key] = ns[key];
      }
    }
    if (node.attributes) {
      let keys = Object.keys(node.attributes);
      for (let key of keys) {
        if (key === "xmlns")
          nsMap["_"] = node.attributes[key];
        if (key.indexOf("xmlns:") === 0) {
          let prefix = key.replace("xmlns:", "");
          nsMap[prefix] = node.attributes[key];
        }
      }
    }
    if (node.name.indexOf(":") < 0) {
      if (nsMap["_"]) {
        node.name = nsMap["_"] + node.name;
      }
    } else if (node.name.indexOf(":") > 0 && node.name.split(":")[0] !== "http" && node.name.split(":")[0] !== "https") {
      let prefix = node.name.split(":")[0];
      if (nsMap[prefix]) {
        node.name = node.name.replace(`${prefix}:`, `${nsMap[prefix]}`);
      }
    }
    if (node.children) {
      for (let child of node.children) {
        applyNS(child, nsMap);
      }
    }
  }
}

// src/xml-parser.ts
var readXMLFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};
var getXMLContents = async (filePath) => {
  const xmlContents = await readXMLFile(filePath);
  if (!xmlContents) {
    throw new Error("Could not get XML contents.");
  }
  return parse(xmlContents);
};

// src/zark.ts
var FILE_PATH = "assets/ZARK.drawio.xml";
var parsedZarkFile = await getXMLContents(FILE_PATH);
var zarkTree = parsedZarkFile.root?.children[0].children[0].children[0].children;
if (!zarkTree) {
  throw new Error("ZarkTree did not have the expected format.");
}
console.log(zarkTree);
