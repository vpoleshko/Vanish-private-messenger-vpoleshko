import sodium from "libsodium-wrappers";

const PROTOCOL = "vanish-e2ee-v1";
const MAX_SKIP = 100;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function u8(value) {
  if (typeof value === "string") {
    return textEncoder.encode(value);
  }

  return value;
}

function concatBytes(...arrays) {
  const length = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(length);

  let offset = 0;

  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

function compareBytes(a, b) {
  const length = Math.min(a.length, b.length);

  for (let i = 0; i < length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }

  if (a.length < b.length) return -1;
  if (a.length > b.length) return 1;

  return 0;
}

export function toBase64(bytes) {
  return sodium.to_base64(
    bytes,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );
}

export function fromBase64(value) {
  return sodium.from_base64(
    value,
    sodium.base64_variants.URLSAFE_NO_PADDING
  );
}

async function sha256(data) {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

async function hmacSha256(keyBytes, dataBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, dataBytes);
  return new Uint8Array(signature);
}

async function hkdf(ikm, salt, info, length) {
  const prk = await hmacSha256(salt, ikm);

  const blocks = [];
  let previous = new Uint8Array();
  let generated = 0;
  let counter = 1;

  while (generated < length) {
    const input = concatBytes(previous, info, new Uint8Array([counter]));
    previous = await hmacSha256(prk, input);

    blocks.push(previous);
    generated += previous.length;
    counter++;
  }

  const output = concatBytes(...blocks).slice(0, length);

  prk.fill(0);
  previous.fill(0);

  for (const block of blocks) {
    block.fill(0);
  }

  return output;
}

async function chainStep(chainKey) {
  const messageKey = await hmacSha256(
    chainKey,
    new Uint8Array([0x01])
  );

  const nextChainKey = await hmacSha256(
    chainKey,
    new Uint8Array([0x02])
  );

  return {
    messageKey,
    nextChainKey,
  };
}

function makeAad(header) {
  return u8(JSON.stringify({
    v: header.v,
    type: header.type,
    roomId: header.roomId,
    senderId: header.senderId,
    receiverId: header.receiverId,
    n: header.n,
    nonce: header.nonce,
  }));
}

async function createFingerprint({ roomId, publicKeyA, publicKeyB }) {
  const orderedA =
    compareBytes(publicKeyA, publicKeyB) <= 0
      ? publicKeyA
      : publicKeyB;

  const orderedB =
    compareBytes(publicKeyA, publicKeyB) <= 0
      ? publicKeyB
      : publicKeyA;

  return sha256(concatBytes(
    u8(`${PROTOCOL}/fingerprint`),
    u8(roomId),
    orderedA,
    orderedB
  ));
}

const WORDS = [
  "acid","acorn","acre","adam","aged","agil","aide","airy","ajax","akin",
  "alba","alga","alma","aloe","alps","also","alto","alum","amen","amid",
  "ammo","ample","anew","ankh","ante","apex","arch","arco","arid","ark",
  "arma","army","arno","arum","atom","atop","aunt","aura","auto","avid",
  "axle","bake","bale","balm","band","bane","bard","bark","barn","base",
  "bath","bead","beam","bean","bear","beck","bell","belt","berg","bile",
  "bind","birch","bird","bite","blot","blow","blue","boar","bold","bolt",
  "bond","bone","book","boom","born","brad","brag","bran","brew","brim",
  "brow","buck","bulb","bulk","bull","burn","burp","burr","byte","cage",
  "cake","calf","calm","came","camp","cane","cape","card","care","carp",
  "cart","case","cave","cede","cell","chad","chef","chin","chip","chop",
  "chum","cider","cite","clam","clan","clap","claw","clay","clef","clip",
  "clod","clog","club","clue","coal","coat","coax","code","coil","coin",
  "cold","colt","cone","cope","cord","core","corn","cove","crag","crew",
  "crop","crow","cuff","cult","curb","cure","curl","damp","dare","dark",
  "dart","dash","data","date","dawn","deal","dean","deck","deep","deft",
  "dell","dent","desk","dew","dial","dice","diet","dirk","disk","dojo",
  "dome","door","dorm","dove","down","drab","drag","draw","drip","drop",
  "drum","dune","dung","dusk","dust","earl","earn","edge","eels","egon",
  "elbow","elm","emit","emul","envy","epic","etch","even","exam","expo",
  "face","fact","fade","fail","fake","fall","fame","fang","farm","fast",
  "fawn","faze","feat","fend","fern","feta","feud","fief","film","find",
  "fire","firm","fish","fist","five","flag","flap","flat","flaw","fled",
  "flew","flex","flip","floe","flow","flux","foam","foe","fold","folk",
  "fond","font","ford","fore","fork","form","fort","foul","four","fray",
  "free","frog","from","fuel","full","fume","fund","furl","gale","gall",
  "game","garb","gate","gave","gaze","gear","gene","gild","gilt","give",
  "glad","gland","glee","glen","glob","glow","glum","glyph","goad","goat",
  "gold","golf","gong","gore","gown","grab","gram","gray","grid","grin",
  "grip","grit","grow","grub","gulf","gull","gust","gyre","hack","hail",
  "half","halt","hand","hard","hare","harp","hash","hasp","haze","heap",
  "heat","heel","helm","hemp","herb","herd","hewn","hide","hill","hilt",
  "hint","hive","hoar","hock","hold","hole","holm","holt","home","hone",
  "hook","hope","horn","hose","hulk","hull","hump","hunt","hurl","hymn",
  "inch","iris","iron","isle","jade","jail","jamb","jerk","jest","jolt",
  "jot","jowl","jump","junk","jury","just","keel","keen","kelp","kerf",
  "kern","kiln","kind","king","knob","knot","lace","lain","lake","lame",
  "lamp","land","lane","lark","lash","laud","lava","lawn","lead","leaf",
  "lean","leap","ledge","lemon","lens","lien","lift","lime","line","link",
  "lion","list","loft","loin","lore","lorn","loss","lout","luge","lung",
  "lure","lurk","mace","malt","mane","mark","mars","mast","math","maze",
  "mead","meal","meat","meld","melt","mesh","mild","mill","mist","mode",
  "mold","mole","molt","monk","moon","moor","more","moss","moth","muck",
  "muon","muse","musk","nail","nape","navy","neem","neon","nest","newt",
  "next","nick","nimb","node","noel","noir","norm","nose","notch","null",
  "numb","oaken","oath","oboe","octo","odor","ogre","ohms","omen","onyx",
  "open","opus","orbs","orca","ordo","origin","oven","oxen","pace","pack",
  "pact","page","pail","pale","palm","pave","pawn","peak","peat","peel",
  "peel","peg","pelt","perk","pike","pile","pine","pink","pith","plan",
  "plod","plop","plot","plow","plum","plus","poem","poll","pond","pore",
  "port","pose","post","pour","prey","prod","prop","prow","pulp","pump",
  "punt","pure","push","quay","quill","race","rack","raft","rain","ramp",
  "rang","rank","rasp","rave","razz","read","ream","reap","reed","reef",
  "reel","rely","rend","rent","resin","rest","rice","rich","ride","riff",
  "rift","rime","rind","ring","riot","rise","risk","rite","road","roam",
  "roar","robe","rock","rode","role","roll","romp","root","rope","rose",
  "rout","rove","ruby","rude","ruin","rule","rump","rune","rusk","rust",
  "safe","sage","sail","salt","sand","sane","sash","save","scan","scar",
  "scud","seal","seam","seed","seek","seep","self","send","serf","shed",
  "shin","ship","silk","silt","sire","site","skew","skip","slab","slam",
  "slap","slat","slew","slim","slip","slot","slow","slug","slum","slur",
  "smog","snap","snip","snow","soak","soar","sock","soil","sole","some",
  "song","soot","sort","soul","span","spar","spin","spit","spot","spur",
  "stab","stag","star","stem","step","stew","stir","stop","stub","stud",
  "stun","suet","sulk","sump","sung","sunk","surf","surge","swam","swan",
  "swap","sway","swig","swim","swum","sync","tack","tame","tang","tarn",
  "tarp","taut","teak","teal","tear","tell","tend","tent","term","tern",
  "test","text","thaw","then","they","thin","thorn","tide","tile","till",
  "tilt","time","tint","tire","toad","toil","told","toll","tomb","tome",
  "tone","tong","tool","tops","torn","tort","toss","tour","town","tram",
  "trap","trim","trio","trip","trod","trot","troy","true","tuft","tuna",
  "turf","tusk","twin","type","urge","used","vale","vane","vast","vat",
  "veil","vein","vent","verb","vest","vial","vibe","view","vile","vine",
  "void","volt","wade","waft","wake","wand","wane","ward","warm","warp",
  "wart","wax","weld","well","wend","went","wick","wild","will","wilt",
  "wimp","wind","wine","wing","wire","wise","wisp","woad","woke","wolf",
  "womb","wore","worm","wove","wren","writ","yam","yard","yarn","yawl",
  "yell","yew","yoke","yore","your","zeal","zero","zest","zinc","zone",
]

function fingerprintToSafetyCode(fingerprint) {
  return [0, 4, 8, 12]
    .map(i => WORDS[fingerprint[i]])
    .join(" · ")
}

export class E2EERatchet {
  constructor(params) {
    this.roomId = params.roomId;
    this.myPeerId = params.myPeerId;
    this.theirPeerId = params.theirPeerId;

    this.myX25519PrivateKey = params.myX25519PrivateKey;
    this.myX25519PublicKey = params.myX25519PublicKey;
    this.theirX25519PublicKey = params.theirX25519PublicKey;

    this.rootKey = params.rootKey;
    this.sendChainKey = params.sendChainKey;
    this.recvChainKey = params.recvChainKey;
    this.voiceKey = params.voiceKey;

    this.fingerprint = params.fingerprint;
    this.safetyCode = params.safetyCode;

    this.sendN = 0;
    this.recvN = 0;

    this.skippedMessageKeys = new Map();
  }

  static async init() {
    await sodium.ready;
  }

  static generateX25519KeyPair() {
    const privateKey = sodium.randombytes_buf(32);
    const publicKey = sodium.crypto_scalarmult_base(privateKey);

    return {
      privateKey,
      publicKey,
      publicKeyBase64: toBase64(publicKey),
    };
  }

  static async create({
    roomId,
    myPeerId,
    theirPeerId,
    myKeyPair,
    theirPublicKey,
  }) {
    await sodium.ready;

    const sharedSecret = sodium.crypto_scalarmult(
      myKeyPair.privateKey,
      theirPublicKey
    );

    try {
      const orderedPubA =
        compareBytes(myKeyPair.publicKey, theirPublicKey) <= 0
          ? myKeyPair.publicKey
          : theirPublicKey;

      const orderedPubB =
        compareBytes(myKeyPair.publicKey, theirPublicKey) <= 0
          ? theirPublicKey
          : myKeyPair.publicKey;

      const salt = await sha256(concatBytes(
        u8(PROTOCOL),
        u8(roomId),
        orderedPubA,
        orderedPubB
      ));

      const material = await hkdf(
        sharedSecret,
        salt,
        u8(`${PROTOCOL}/initial-session`),
        96
      );

      const rootKey = material.slice(0, 32);
      const chainLowToHigh = material.slice(32, 64);
      const chainHighToLow = material.slice(64, 96);

      material.fill(0);

      const fingerprint = await createFingerprint({
        roomId,
        publicKeyA: myKeyPair.publicKey,
        publicKeyB: theirPublicKey,
      });

      const safetyCode = fingerprintToSafetyCode(fingerprint);

      const iAmLow =
        compareBytes(myKeyPair.publicKey, theirPublicKey) <= 0;

      // Separate static key for voice — ratchet overhead not needed for real-time audio
      const voiceKey = await hkdf(
        rootKey,
        new Uint8Array(32),
        u8(`${PROTOCOL}/voice`),
        32
      );

      return new E2EERatchet({
        roomId,
        myPeerId,
        theirPeerId,
        myX25519PrivateKey: myKeyPair.privateKey,
        myX25519PublicKey: myKeyPair.publicKey,
        theirX25519PublicKey: theirPublicKey,
        rootKey,
        sendChainKey: iAmLow ? chainLowToHigh : chainHighToLow,
        recvChainKey: iAmLow ? chainHighToLow : chainLowToHigh,
        voiceKey,
        fingerprint,
        safetyCode,
      });
    } finally {
      sharedSecret.fill(0);
    }
  }

  async encryptText(plainText) {
    const { messageKey, nextChainKey } = await chainStep(this.sendChainKey);

    this.sendChainKey.fill(0);
    this.sendChainKey = nextChainKey;

    const nonce = sodium.randombytes_buf(
      sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    );

    const header = {
      v: 1,
      type: "e2ee_message",
      roomId: this.roomId,
      senderId: this.myPeerId,
      receiverId: this.theirPeerId,
      n: this.sendN,
      nonce: toBase64(nonce),
    };

    const aad = makeAad(header);

    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      u8(plainText),
      aad,
      null,
      nonce,
      messageKey
    );

    messageKey.fill(0);
    nonce.fill(0);

    this.sendN++;

    return {
      ...header,
      ciphertext: toBase64(ciphertext),
    };
  }

  async decryptText(packet) {
    if (!packet || typeof packet !== "object") {
      throw new Error("Invalid packet");
    }

    if (packet.v !== 1 || packet.type !== "e2ee_message") {
      throw new Error("Invalid packet type");
    }

    if (packet.roomId !== this.roomId) {
      throw new Error("Invalid room");
    }

    if (packet.senderId !== this.theirPeerId) {
      throw new Error("Invalid sender");
    }

    if (packet.receiverId !== this.myPeerId) {
      throw new Error("Invalid receiver");
    }

    if (!Number.isSafeInteger(packet.n) || packet.n < 0) {
      throw new Error("Invalid message number");
    }

    const skippedKeyId = `${packet.senderId}:${packet.n}`;

    if (this.skippedMessageKeys.has(skippedKeyId)) {
      const messageKey = this.skippedMessageKeys.get(skippedKeyId);

      this.skippedMessageKeys.delete(skippedKeyId);

      try {
        return this.decryptWithMessageKey(packet, messageKey);
      } finally {
        messageKey.fill(0);
      }
    }

    if (packet.n < this.recvN) {
      throw new Error("Old or replayed message");
    }

    if (packet.n - this.recvN > MAX_SKIP) {
      throw new Error("Too many skipped messages");
    }

    while (this.recvN < packet.n) {
      const { messageKey, nextChainKey } = await chainStep(this.recvChainKey);

      this.recvChainKey.fill(0);
      this.recvChainKey = nextChainKey;

      const keyId = `${packet.senderId}:${this.recvN}`;
      this.skippedMessageKeys.set(keyId, messageKey);

      this.recvN++;
    }

    const { messageKey, nextChainKey } = await chainStep(this.recvChainKey);

    this.recvChainKey.fill(0);
    this.recvChainKey = nextChainKey;

    this.recvN++;

    try {
      return this.decryptWithMessageKey(packet, messageKey);
    } finally {
      messageKey.fill(0);
    }
  }

  decryptWithMessageKey(packet, messageKey) {
    const nonce = fromBase64(packet.nonce);
    const ciphertext = fromBase64(packet.ciphertext);
    const aad = makeAad(packet);

    try {
      const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        ciphertext,
        aad,
        nonce,
        messageKey
      );

      return textDecoder.decode(plaintext);
    } finally {
      nonce.fill(0);
      ciphertext.fill(0);
    }
  }

  // Voice: static key, random nonce per chunk — returns Uint8Array: [nonce][ciphertext]
  encryptVoice(plainBytes) {
    const NONCE_LEN = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
    const nonce = sodium.randombytes_buf(NONCE_LEN);
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plainBytes instanceof Uint8Array ? plainBytes : new Uint8Array(plainBytes),
      null, null, nonce, this.voiceKey
    );
    return concatBytes(nonce, ciphertext);
  }

  // Voice: expects Uint8Array [nonce][ciphertext] — returns Uint8Array plaintext
  decryptVoice(data) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    const NONCE_LEN = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
    const nonce = bytes.slice(0, NONCE_LEN);
    const ciphertext = bytes.slice(NONCE_LEN);
    return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null, ciphertext, null, nonce, this.voiceKey
    );
  }

  destroy() {
    this.myX25519PrivateKey?.fill(0);
    this.rootKey?.fill(0);
    this.sendChainKey?.fill(0);
    this.recvChainKey?.fill(0);
    this.voiceKey?.fill(0);
    this.fingerprint?.fill(0);

    for (const key of this.skippedMessageKeys.values()) {
      key.fill(0);
    }

    this.skippedMessageKeys.clear();

    this.myX25519PrivateKey = null;
    this.rootKey = null;
    this.sendChainKey = null;
    this.recvChainKey = null;
    this.voiceKey = null;
    this.fingerprint = null;
    this.safetyCode = null;
  }
}