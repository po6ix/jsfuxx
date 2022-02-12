const crypto = require('crypto');

const randomInteger = (i) => {
  return Math.floor(Math.random() * i);
}

const shuffle_arr = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class InputGenerator {
  _tags;
  _chars;
  _attributes;
  
  constructor(config) {
    if (!config.tags || !config.attributes || !config.chars) {
      throw new Error('insufficient arguments');
    }
    this._tags = config.tags;
    this._attributes = config.attributes;
    this._chars = config.chars;
  }

  generate(size) {
    const bytes = crypto.randomBytes(size);
    const array = new Array(size);

    for (let i = 0; i < size; ++i) {
      array[i] = this._chars[bytes[i] % this._chars.length];
    }
    return array.join('');
  }
}

class DOMGenerator extends InputGenerator {
  randomTag() {
    return this._tags[randomInteger(this._tags.length)];
  }
  randomAttribute() {
    return this._attributes[randomInteger(this._attributes.length)];
  }
  generate(size) {
    let arr = [];
    let unclosed = [];

    for (let i = 0; i < size; ++i) {
      let unit_type = randomInteger(5);

      /* 0: `<TAGNAME ` */
      if (unit_type == 0) {
        let tag = this.randomTag()
        arr.push('<' + tag);
        unclosed.push(tag);
      /* 1: `</TAGNAME ` */
      } else if (unit_type == 1) {
        arr.push('</' + this.randomTag() + ' ');
      /* 2: `ATTRIBUTE ='` */
      } else if (unit_type == 2) {
        arr.push(this.randomAttribute()+ '=\'');
       //3: `ATTRIBUTE >` 
      } else if (unit_type == 3) {
        arr.push(this.randomAttribute() + ' >');
       //4: 50%: `' ` 
      //[> 5: `RANDOM_CHARS*24` <]
      } else if (unit_type == 4) {
        arr.push(super.generate(36));
      } else {
        console.error('Unreachable'.red);
        process.exit(1);
      }
    }

    if (unclosed.length != 0) {
      unclosed = shuffle_arr(unclosed);

      for (let tag of unclosed) {
        arr.push('</' + tag + '>');
      }
    }

    return arr.join('');
  }
};

module.exports = {
  InputGenerator,
  DOMGenerator
};
