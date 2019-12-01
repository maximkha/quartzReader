//https://github.com/dariusk/pos-js
var re = {
  ids: /(?:^|\s)[a-z0-9-]{8,45}(?:$|\s)/ig, // ID, CRC, UUID's
  number: /[0-9]*\.[0-9]+|[0-9]+/ig,
  space: /\s+/ig,
  unblank: /\S/,
  email: /[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](?:\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](?:-?\.?[a-zA-Z0-9])*(?:\.[a-zA-Z](?:-?[a-zA-Z0-9])*)+/gi,
  urls: /(?:https?:\/\/)(?:[\da-z\.-]+)\.(?:[a-z\.]{2,6})(?:[\/\w\.\-\?#=]*)*\/?/ig,
  punctuation: /[\/\.\,\?\!\"\'\:\;\$\(\)\#\’\`]/ig,
  time: /(?:[0-9]|0[0-9]|1[0-9]|2[0-3]):(?:[0-5][0-9])\s?(?:[aApP][mM])/ig
}

function LexerNode(string, regex, regexs){
  string = string.trim();
  this.string = string;
  this.children = [];

  if (string) {
    this.matches = string.match(regex);
    var childElements = string.split(regex);
  }

  if (!this.matches) {
    this.matches = [];
    var childElements = [string];
  }

  if (!regexs.length) {
    // no more regular expressions, we're done
    this.children = childElements;
  } else {
    // descend recursively
    var nextRegex = regexs[0], nextRegexes = regexs.slice(1);

    for (var i in childElements) {
      if (childElements.hasOwnProperty(i)) {
        this.children.push(
          new LexerNode(childElements[i], nextRegex, nextRegexes));
      }
    }
  }
}

LexerNode.prototype.fillArray = function(array){
  for (var i in this.children) {
    if (this.children.hasOwnProperty(i)) {
      var child = this.children[i];

      if (child.fillArray) {
        child.fillArray(array);
      } else if (re.unblank.test(child)) {
        array.push(child.trim());
      }

      if (i < this.matches.length) {
        var match = this.matches[i];
        if (re.unblank.test(match))
          array.push(match.trim());
      }
    }
  }
}

LexerNode.prototype.toString = function(){
  var array = [];
  this.fillArray(array);
  return array.toString();
}

function Lexer(){
  // URLS can contain IDS, so first urls, then ids
  // then split by then numbers, then whitespace, then email and finally punctuation
  // this.regexs = [re.urls, re.ids, re.number, re.space, re.email, re.punctuation];
  this.regexs = [
    re.urls, re.ids, re.time, re.number, re.space, re.email, re.punctuation
  ];
}

Lexer.prototype.lex = function(string){
  var array = []
    , node = new LexerNode(string, this.regexs[0], this.regexs.slice(1));

  node.fillArray(array);
  return array;
}

var lexer = new Lexer();
console.log(lexer.lex("I made $5.60 today in 1 hour of work.  The E.M.T.'s were on time, but only barely.").toString());

/*
  Transformation rules for Brill's POS tagger
  Copyright (C) 2015 Hugo W.L. ter Doest
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// Usage: 
// transformationRules = new BrillTransformationRules();
// transformationRules.rules.forEach(function(ruleFunction) {
//   ruleFunction(taggedSentence, i);
// });
// where taggedSentence is an array of arrays of the form:
// [[the, DET], [red, JJ], [book, NN]] and i the position to be processed

function BrillTransformationRules() {
    this.rules = [rule1, rule2, rule3, rule4, rule5, rule6, rule7, rule8];
  }
  
  BrillTransformationRules.prototype.getRule = function(index) {
    return(this.rules[index]);
  };
  
  BrillTransformationRules.prototype.setRule = function(index, rule) {
    this.rules[index] = rule;
  };
  
  BrillTransformationRules.prototype.appendRule = function(rule) {
    this.rules[this.rules.length] = rule;
  };
  
  BrillTransformationRules.prototype.setRules = function(newRules) {
    this.rules = newRules;
  };
  
  BrillTransformationRules.prototype.getRules = function() {
    return(this.rules);
  };
  
  /**
   * Indicates whether or not this string starts with the specified string.
   * @param {Object} string
   */
  function startsWith($this, string) {
    if (!string) {
      return false;
    }
    return $this.indexOf(string) == 0;
  }
  
  /**
   * Indicates whether or not this string ends with the specified string.
   * @param {Object} string
   */
  function endsWith($this, string) {
    if (!string || string.length > $this.length) {
      return false;
    }
    return $this.indexOf(string) == $this.length - string.length;
  }
  
  //  rule 1: DT, {VBD | VBP} --> DT, NN
  function rule1(taggedSentence, index) {
    if ((index > 0) && (taggedSentence[index - 1][1] === "DT")) {
      if ((taggedSentence[index][1] === "VBD") ||
        (taggedSentence[index][1] === "VBP") ||
        (taggedSentence[index][1] === "VB")) {
        taggedSentence[index][1] = "NN";
      }
    }
  }
  
  // rule 2: convert a noun to a number (CD) if "." appears in the word
  function rule2(taggedSentence, index) {
    if (startsWith(taggedSentence[index][1], "N")) {
      if (taggedSentence[index][0].indexOf(".") > -1) {
        // url if there are two contiguous alpha characters
        if (/[a-zA-Z]{2}/.test(taggedSentence[index][0])) {
          taggedSentence[index][1] = "URL";
        }
        else {
          taggedSentence[index][1] = "CD";
        }
      }
      // Attempt to convert into a number
      if (!isNaN(parseFloat(taggedSentence[index][0]))) {
        taggedSentence[index][1] = "CD";
      }
    }
  }
  
  // rule 3: convert a noun to a past participle if words[i] ends with "ed"
  function rule3(taggedSentence, index) {
    if (startsWith(taggedSentence[index][1], "N") && endsWith(taggedSentence[index][0], "ed")) {
      taggedSentence[index][1] = "VBN";
    }
  }
  
  // rule 4: convert any type to adverb if it ends in "ly";
  function rule4(taggedSentence, index) {
    if (endsWith(taggedSentence[index][0], "ly")) {
      taggedSentence[index][1] = "RB";
    }
  }
  
  // rule 5: convert a common noun (NN or NNS) to a adjective if it ends with "al"
  function rule5(taggedSentence, index) {
    if (startsWith(taggedSentence[index][1], "NN") && endsWith(taggedSentence[index][0], "al")) {
      taggedSentence[index][1] = "JJ";
    }
  }
  
  // rule 6: convert a noun to a verb if the preceding work is "would"
  function rule6(taggedSentence, index) {
    if ((index > 0) && startsWith(taggedSentence[index][1], "NN") && (taggedSentence[index - 1][0].toLowerCase() === "would")) {
      taggedSentence[index][1] = "VB";
    }
  }
  
  // rule 7: if a word has been categorized as a common noun and it ends with "s",
  //         then set its type to plural common noun (NNS)
  function rule7(taggedSentence, index) {
    if ((taggedSentence[index][1] === "NN") && (endsWith(taggedSentence[index][0], "s"))) {
      taggedSentence[index][1] = "NNS";
    }
  }
  
  // rule 8: convert a common noun to a present participle verb (i.e., a gerund)
  function rule8(taggedSentence, index) {
    if (startsWith(taggedSentence[index][1], "NN") && endsWith(taggedSentence[index][0], "ing")) {
      taggedSentence[index][1] = "VBG";
    }
  }

  var transformationRules = new BrillTransformationRules();

function POSTagger(){
    this.lexicon = window.Lexicon;
}

POSTagger.prototype.wordInLexicon = function(word){
    var ss = this.lexicon[word];
    if (ss != null)
        return true;
    // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
    if (!ss)
        ss = this.lexicon[word.toLowerCase()];
    if (ss)
        return true;
    return false;
}

POSTagger.prototype.tag = function(words) {
  var taggedSentence = new Array(words.length);

  // Initialise taggedSentence with words and initial categories
  for (var i = 0, size = words.length; i < size; i++) {
    taggedSentence[i] = new Array(2);
    taggedSentence[i][0] = words[i];
    // lexicon maps a word to an array of possible categories
    var ss = this.lexicon[words[i]];
    // 1/22/2002 mod (from Lisp code): if not in hash, try lower case:
    if (!ss)
      ss = this.lexicon[words[i].toLowerCase()];
    if (!ss && (words[i].length === 1))
      taggedSentence[i][1] = words[i] + "^";
    // We need to catch scenarios where we pass things on the prototype
    // that aren't in the lexicon: "constructor" breaks this otherwise
    if (!ss || (Object.prototype.toString.call(ss) !== '[object Array]'))
      taggedSentence[i][1] = "NN";
    else
      taggedSentence[i][1] = ss[0];
  }

  // Apply transformation rules
  taggedSentence.forEach(function(taggedWord, index) {
    transformationRules.getRules().forEach(function(rule) {
      rule(taggedSentence, index);
    });
  });
  return taggedSentence;
}

POSTagger.prototype.prettyPrint = function(taggedWords) {
	for (i in taggedWords) {
        print(taggedWords[i][0] + "(" + taggedWords[i][1] + ")");
    }
}

POSTagger.prototype.extendLexicon = function(lexicon) {
  for (var word in lexicon) {
    if (!this.lexicon.hasOwnProperty(word)) {
      this.lexicon[word] = lexicon[word];
    }
  }
}
console.log(new POSTagger().tag(["i", "went", "to", "the", "store", "to", "buy", "5.2", "gallons", "of", "milk"]));