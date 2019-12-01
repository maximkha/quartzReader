window.onload = main;
var consoleMode = false;

function main()
{
  //Get feed
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      feedReady(this.responseText);
    }
  };
  xhttp.open("GET", "https://cors-anywhere.herokuapp.com/https://cms.qz.com/feed/", true);
  xhttp.send();
}

var currentArticle = 0;
var defaultN = 5;
var curArticleObj = 0;
var stories;
var tK = 4;

function feedReady(xml)
{
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xml, "text/xml");
  stories = xmlDoc.getElementsByTagName("item");
  //console.log(stories);
  if (consoleMode)
  {
    getCurrentArticle();
  }
  else
  {
    for(var i = 0; i < stories.length; i++)
    {
        console.log(i);
        var articleObj = getArticle(i);
        var ArticleHolder = document.createElement("div");
        
        var ArticleTitle = document.createElement("h1");
        ArticleTitle.style = "font-family: monospace; font-size: 25px;";
        ArticleTitle.innerText = articleObj.title;
        ArticleHolder.appendChild(ArticleTitle);

        var ArticleLink = document.createElement("a");
        ArticleLink.style = "font-family: monospace; font-size: 15px;";
        ArticleLink.href = articleObj.link;
        ArticleLink.innerText = articleObj.link;
        ArticleHolder.appendChild(ArticleLink);
        ArticleHolder.appendChild(document.createElement("br"));

        var ArticleDesc = document.createElement("span");
        ArticleDesc.style = "font-family: monospace; font-size: 20px;";
        ArticleDesc.innerText = articleObj.description;
        ArticleHolder.appendChild(ArticleDesc);
        ArticleHolder.appendChild(document.createElement("br"));

        var ArticleRemoteKeys = document.createElement("span");
        ArticleRemoteKeys.style = "font-family: monospace; font-size: 12px;";
        ArticleRemoteKeys.innerText = articleObj.categories.join(",");
        ArticleHolder.appendChild(ArticleRemoteKeys);
        ArticleHolder.appendChild(document.createElement("br"));

        var ArticleLocalKeys = document.createElement("span");
        ArticleLocalKeys.style = "font-family: monospace; font-size: 12px;";
        ArticleLocalKeys.innerText = articleObj.keywords.slice(0,5).map((x)=>x[0]).join(",");
        ArticleHolder.appendChild(ArticleLocalKeys);
        ArticleHolder.appendChild(document.createElement("br"));

        var lines = articleObj.textRank.slice(0,5);
        for (var j = 0; j < lines.length; j++)
        {
            var ArticleLine = document.createElement("span");
            ArticleLine.style = "font-family: monospace; font-size: 15px; -moz-tab-size: 4; tab-size: 4;";
            //ArticleLine.innerText += lines[j][0];
            ArticleLine.innerHTML += "<span style=\"display: inline-block;margin-left: 10px;\"></span><span>" + lines[j][0] + "</span>";
            ArticleHolder.appendChild(ArticleLine);
            ArticleHolder.appendChild(document.createElement("br"));
            ArticleHolder.appendChild(document.createElement("br"));
        }
        ArticleHolder.appendChild(document.createElement("br"));
        ArticleHolder.appendChild(document.createElement("br"));
        ArticleHolder.appendChild(document.createElement("br"));
        document.body.append(ArticleHolder);
    }
  }
}

function summarizeDocument(sentences)
{
    var ranked = getBestSentence(sentences, tK);
    ranked = ranked.sort((x,y)=>y[1]-x[1]).map((x)=>[x[0].replace(/(\r\n|\n|\r|\\n)/gm, ''),x[1]]);
    return ranked;
}

function keywordsDocument(sentences)
{
    var ranked = processDocumentKeywords(sentences, tK);
    ranked = ranked.sort((x,y)=>y[1]-x[1]);//.map((x)=>[x[0], x[1]]);
    return ranked;
}

//var htmlDoc;
function getArticle(i)
{
    //The header
    rObj = {};
    rObj.xmlDoc = stories[i];
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(rObj.xmlDoc.getElementsByTagName("content:encoded")[0].textContent, "text/html");

    //var el = document.createElement('html');
    //el.innerHTML = curArticleObj.xmlDoc.getElementsByTagName("content:encoded")[0].textContent;
    //curArticleObj.text = el.innerText;
    //console.log(htmlDoc);
    rObj.text = htmlDoc.body.textContent;
    rObj.pubDate = rObj.xmlDoc.getElementsByTagName("pubDate")[0].textContent;
    rObj.categories = Array.from(rObj.xmlDoc.getElementsByTagName("category")).map((x)=>x.textContent);
    rObj.sentences = getSentences(rObj.text);
    rObj.keywords = keywordRank(keywordsDocument(rObj.sentences));
    rObj.textRank = summarizeDocument(rObj.sentences);
    rObj.link = rObj.xmlDoc.getElementsByTagName("link")[0].textContent;
    rObj.description = rObj.xmlDoc.getElementsByTagName("description")[0].textContent;
    rObj.title = rObj.xmlDoc.getElementsByTagName("title")[0].textContent;
    return rObj;
}

function getCurrentArticle()
{
    curArticleObj = getArticle(currentArticle);

    display();
}

function display()
{
    console.log("%c"+curArticleObj.title, "font-size: 25px;");
    console.log("%c"+curArticleObj.link, "font-size: 15px;");
    console.log("%c"+curArticleObj.description, "font-size: 20px;");
    console.log("%c"+curArticleObj.categories, "font-size: 15px;");
    console.log("%c"+tags(), "font-size: 15px;");
    console.log("%cMore ? Next", "font-size: 10px; color:#ffa500");
}

function displayEnd()
{
    console.log("END");
}

function next()
{
    currentArticle++;
    if (currentArticle >= stories.length) {displayEnd(); currentArticle = stories.length - 1; return;}
    getCurrentArticle();
}

function back()
{
    currentArticle--;
    if (currentArticle < 0) {displayEnd(); currentArticle = 0; return;}
    getCurrentArticle();
}


function more(n)
{
    if (n > 0) 
    {
        var lines = curArticleObj.textRank.slice(0,n);
        for (var i = 0; i < lines.length; i++)
        {
            console.log("%c" + lines[i][0], "font-size: 15px;");
        }
    }
    else
    {
        var lines = curArticleObj.textRank.slice(0,defaultN);
        for (var i = 0; i < lines.length; i++)
        {
            console.log("%c" + lines[i][0], "font-size: 15px;");
        }
    }
}

function tags(n=5)
{
    var lines = curArticleObj.keywords.slice(0,n).map((x)=>x[0]);
    return lines;
    //console.log(lines);
}