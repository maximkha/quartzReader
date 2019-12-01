//Text rank with Pos tagger

function getBestSentence(sentences, n)
{
    var keywords = processDocumentKeywords(sentences, n);
    //keywords = keywords.sort((x,y)=>y[2]-x[2]);
    //var sentences = getSentences(text);
    var ret = [];
    for (var i = 0; i < sentences.length; i++)
    {
        var sentenceScore = 0;
        var sentenceKeys = GetKeywordsSentence(sentences[i]);
        var pairs = createPairs(sentenceKeys, n);
        for (var j = 0; j < pairs.length; j++)
        {
            //pairs[j];
            
            for (var k = 0; k < keywords.length; k++)
            {
                //console.log(pairs[j],  keywords[k]);
                if (pairsEqual(pairs[j], keywords[k])) 
                {
                    sentenceScore += pairs[j][2]*keywords[k][2];
                    //console.log(pairs[j][2]*keywords[k][2]);
                }
            }
        }
        ret.push([sentences[i], sentenceScore]);
    }
    return ret;
}

function processDocumentKeywords(sentences, k)
{
    //var sentences = getSentences(text);
    var ret = [];
    for (var i = 0; i < sentences.length; i++)
    {
        var pairs = createPairs(GetKeywordsSentence(sentences[i]), k);
        ret = joinPairs(ret, pairs);
    }
    return ret;
}

function getSentences(text)
{
    return sentences(text);
}

function isLetterOrNum(text)
{
    return text.match(/^[0-9a-zA-Z]+$/) ? true : false;
}

function keywordRank(keywords)
{
    //Since the keywords are symmetric, we only have to do a single direction
    var keywordRanks = {};
    for (var i = 0; i < keywords.length; i++)
    {
        if(!keywordRanks.hasOwnProperty(keywords[i][0]))
        {
            keywordRanks[keywords[i][0]] = keywords[i][2];
            continue;
        }
        keywordRanks[keywords[i][0]] += keywords[i][2];
    }

    return Object.entries(keywordRanks).sort((x, y)=>y[1]-x[1]);
}

function GetKeywordsSentence(sentence)
{
    //Get all keywords from sentence
    //Later we can rank them
    //sentence = "Hello dad, I am very tired!";
    var tags = new POSTagger().tag(new Lexer().lex(sentence));
    var keywords = [];
    for (var i = 0; i < tags.length; i++)
    {
        var tagPair = tags[i];
        if (tagPair[1][0] == "N" && !isStopWord(tagPair[0]) && isLetterOrNum(tagPair[0])) 
        {
            //If the first char of the tag starts with an N, it means it's a noun
            keywords.push(tagPair[0]);
        }
    }
    return keywords;
}

function createPairs(keywords, k)
{
    var keywordWindows = windowArray(keywords, k);
    var res = [];
    for (var i = 0; i < keywordWindows.length; i++)
    {
        res = joinPairs(res, processWindow(keywordWindows[i]));
    }
    return res;
}

function windowArray(arr, n)
{
    //[a,b,c,d],2
    //=>[a,b],[b,c],[c,d]
    var res = [];
    for(var i = 0; i < arr.length; i++)
    {
        if (i + n > arr.length) break;
        res.push(arr.slice(i, i+n));
    }
    return res;
}

Array.prototype.clone = function() { return this.slice(0); };

function pairsEqual(relation1, relation2)
{
    return (relation1[0] == relation2[0] && relation1[1] == relation2[1]);
}

//joinPairs([["a", "b", 1], ["a", "c", 2]], [["a", "b", 2], ["b", "c", 3]]);
function joinPairs(main, toAdd)
{
    //Format of both arrays: [["a", "b", 1],["a", "c", 2]]
    var res = main.clone();
    var add = [];
    for(var i = 0; i < toAdd.length; i++)
    {
        var relationToAdd = toAdd[i];
        var added = false;
        for(var j = 0; j < main.length; j++)
        {
            var curRelation = main[j];
            if (pairsEqual(relationToAdd, curRelation))
            {
                res[j][2] += relationToAdd[2];
                added = true;
                break;
            }
        }
        if (added) continue;
        for(var j = 0; j < add.length; j++)
        {
            var curRelation = add[j];
            if (pairsEqual(relationToAdd, curRelation))
            {
                add[j][2] += relationToAdd[2];
                added = true;
                break;
            }
        }
        if (added) continue;
        add.push([relationToAdd[0], relationToAdd[1], relationToAdd[2]]);
    }

    for(var j = 0; j < add.length; j++)
    {
        res.push(add[j]);
    }

    return res;
}

function processWindow(keywords)
{
    //["a","b","c"]
    //=>["a", "b", 1], ["a", "c", 1], ["b", "c", 1]
    var ret = [];
    for (var i = 0; i < keywords.length - 1; i++)
    {
        for (var k = i + 1; k < keywords.length; k++)
        {
            //console.log(keywords[i], keywords[k]);
            //For Symmetry:
            ret = joinPairs(ret, [[keywords[k], keywords[i], 1]]);
            ret = joinPairs(ret, [[keywords[i], keywords[k], 1]]);
            //console.log(ret);
        }
    }
    return ret;
}