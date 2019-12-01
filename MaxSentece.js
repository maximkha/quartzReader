//var inp = 'The controversy over a planned coal plant in Kenya’s idyllic coast is far from over. The United Nations cultural organization this week called on the Kenyan government to reassess the impact of the coal-fired power project on the heritage and natural environment of Lamu. The archipelago is designated as a UNESCO World Heritage Site and is considered the oldest and best-preserved Swahili settlement in East Africa. The decision was made during UNESCO’s 43rd session in Baku, the capital of Azerbaijan. The heritage committee asked Nairobi to also review the cultural and environmental impact of the Lamu Port South Sudan Transport Corridor (LAPSSET), a multibillion-dollar infrastructure and transport project connecting Kenya, Ethiopia, and South Sudan. Calling the situation a “matter of urgency,” UNESCO also lamented Nairobi’s provision of “only limited information” over the years, especially how the LAPSSET project would impact Lamu’s traditional architecture and history.'

var stopChars = [".", "?", "!"];
//matching chars e.g. '(' and ')' must be at the same index in open and close arrays
var openImmune = ["(", "[", "{", "<"];
var closeImmune = [")", "]", "}", ">"];
var toggleImmune = ['"']; //removed single quote so "'s" doesn't break it.


function sentences(str)
{
  var state = 0;
  var sents = [];
  var buffer = "";
  var immuneCounter = {};


  //make quotes easier to process
  str = str.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');


  for (var i = 0; i < str.length; i++)
  {
    var curChar = str.charAt(i);
    //console.log(state);
    //console.log(buffer);
    //console.log(immuneCounter);
    if (state == 0)
    {
      if (/[a-zA-Z]/.test(curChar))
      {
        if (curChar == curChar.toUpperCase())
        {
          state = 1;
          buffer += curChar;
        }
      }
    }
    else if (state == 1)
    {
      buffer += curChar;
      if (isToggleImmune(curChar))
      {
        //immuneCounter[curChar] = readMapObj(immuneCounter, curChar, 0) + 1;
        state = 2;
      }
      else if (isOpenImmune(curChar))
      {
        immuneCounter[openImmune.indexOf(curChar)] = readMapObj(immuneCounter, openImmune.indexOf(curChar), 0) + 1;
        state = 2;
      }
      else if (stopChars.includes(curChar))
      {
        state = 0;
        sents.push(buffer);
        buffer = "";
      }
    }
    else if (state == 2)
    {
      buffer += curChar;
      // if its a toggle try to close it
      if (isToggleImmune(curChar))
      {
        //immuneCounter[curChar] = readMapObj(immuneCounter, curChar, 0) - 1;
        state = 1;
      }
      else if (isOpenImmune(curChar))
      {
        immuneCounter[openImmune.indexOf(curChar)] = readMapObj(immuneCounter, openImmune.indexOf(curChar), 0) + 1;
      }
      else if (isCloseImmune(curChar))
      {
        immuneCounter[closeImmune.indexOf(curChar)] = readMapObj(immuneCounter, closeImmune.indexOf(curChar), 0) - 1;
      }


      if (Object.values(immuneCounter).reduce((a, b) => a + b, 0) <= 0)
      {
        if (toggleImmune.includes(curChar))
        {
          //state = 0; //when a quote closes, the sentence ends.
          //sents.push(buffer);
          //buffer = "";
          state = 1;
        }
        else
        {
          state = 1; //parentheses and brackets are followed by a period.
        }
      }
    }
  }
  if (buffer.length > 0) sents.push(buffer);
  return sents;
}


function isOpenImmune(ch)
{
  return openImmune.includes(ch);
}


function isToggleImmune(ch)
{
  return toggleImmune.includes(ch);
}


function isCloseImmune(ch)
{
  return closeImmune.includes(ch);
}


function readMapObj(mapObj, key, defvalue)
{
  if (!mapObj.hasOwnProperty(key)) return defvalue;
  return mapObj[key];
}

// console.log(sentences("First, second. Third!"));


// console.log(sentences("One(1), 'Two' Three."));


// console.log(sentences(inp));
