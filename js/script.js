import cryptico from "cryptico";
import Vue from "vue/dist/vue";
import uikit_styles from "../node_modules/uikit/dist/css/uikit.min.css";
import styles from '../sass/style.scss';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import emoji from 'emoji.json';

let bits = 512;
let reverseEmoji = emoji.map((v,i) => { return [v.char, i]; })
                        .reduce((acc, v) => {
                          acc[v[0]] = v[1];
                          return acc;
                        }, {})

let storage = localStorage;

let emojiStringToArray = function (str) {
  var split = str.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);
  var arr = [];
  for (var i=0; i<split.length; i++) {
    var char = split[i]
    if (char !== "") {
      arr.push(char);
    }
  }
  return arr;
};

let crypto = new Vue({
  el: '#crypto',
  data: {
    passphrase: '',
    rsakey: null,
    pubkeystr: null,
    friendspubkey: '',
    sendMsg: '',
    actualPubKey: '',
    incomingMsg: '',
    text: '',
  },
  computed: {
    pubkey: function() {
      this.rsakey = cryptico.generateRSAKey(this.passphrase, bits);
      this.pubkeystr = cryptico.publicKeyString(this.rsakey);
      var emojiStr = cryptico.publicKeyID(this.pubkeystr).split("").slice(0,4).reduce((acc, v) => {
        return acc + emoji[v.charCodeAt(0)].char;
      }, "");
      storage.setItem(emojiStr, this.pubkeystr);
      return emojiStr;
    },
    encryptSendMsg: function() {

      this.actualPubKey = storage.getItem(this.friendspubkey);

      emojiStringToArray(this.friendspubkey).reduce((acc, v) => {
        return acc + String.fromCharCode(reverseEmoji[v]);
      }, "");

      if(this.sendMsg == '' || this.friendspubkey == '') return '';
      var encryptedRes = cryptico.encrypt(this.sendMsg, this.actualPubKey);
      this.text = encryptedRes.cipher;
      return encryptedRes.cipher;
    },
    deciphered: function() {
      console.log("updating...")
      if(this.incomingMsg == '') return '';
      var decrypted = cryptico.decrypt(this.incomingMsg, this.rsakey);
      return decrypted.plaintext;
    }
  }
})
