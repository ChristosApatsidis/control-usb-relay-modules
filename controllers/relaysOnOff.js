const USBRelay = require("../modules/usbrelay");
const Relay = require("../models/relay");

module.exports.Relays = async (req, res) => {
  const relays = await Relay.find({ });
  return res.status(200).json({ relays });
}


module.exports.ConnectedRelays = async (req, res) => {
  const relays = USBRelay.Relays;
  return res.status(200).json({relays});
}

module.exports.SyncPath = async (req, res) => {
  const { _id, product, serial } = req.body;

  const relays = USBRelay.Relays;

  if (relays.length === 0) {
    return res.status(403).json({ message: "No ralay devices are connected" });
  }

  let relayDb;
  relayDb = await Relay.findOne({ _id, product, serial }).select('-__v');

  if (!relayDb) {
    return res.status(505).json({ message: 'Error processing the request' });
  }

  for (let i = 0; i < relays.length; i++) {
    if (relays[i].product === product && relays[i].serial === serial) {
      relayDb.HID = relays[i].path;
      await relayDb.save();
      return res.status(200).json({relay: relayDb});
    } else {
      return res.status(403).json({ message: "Device are not connected" });
    }
  }

}


module.exports.SyncPathAll = async (req, res) => {
  const relays = USBRelay.Relays;

  if (relays.length === 0) {
    return res.status(403).json({ message: "No ralay devices are connected" });
  }

  for (let i = 0; i < relays.length; i++) {
    await Relay.findOneAndUpdate({ product: relays[i].product, serial: relays[i].serial }, { HID: relays[i].path });
  }

  return res.status(200).json({relays});
}


module.exports.RelayOpen = async (req, res) => {
  const { _id, Id, open, HID } = req.body;

  if (!_id || !Id || !HID) {
    return res.status(505).json({ message: 'Error processing the request' });
  }

  let relay;
  try {
    relay = new USBRelay(HID);
  } catch(err) {
    return res.status(403).json({ message: "Device are not connected", Id, HID });
  }

  // Find ralay and update it
  let relayDb;
  try {
    relayDb = await Relay.findOneAndUpdate({ _id, Id }, { open: open }, { new: true }).select('-__v'); 
  } catch(err) {
    return res.status(505).json({ message: 'Error processing the request' });
  }

  if (!relayDb) {
    return res.status(505).json({ message: 'Error processing the request 1' });
  }

  relay.setState(Id, open);
  return res.status(200).json({ relay: relayDb });
}


module.exports.RelayNew = async (req, res) => {
  const { name, type, Id, product, serial, HID } = req.body;

  if (!name || !type || !Id || !HID) {
    return res.status(505).json({ message: 'Error processing the request' });
  }

  // Check if realy with same HID and Id already exist
  const relayDb = await Relay.findOne({ HID, Id }).select('-__v').catch((err) => {
    return res.status(505).json({ message: 'Error processing the request' });
  });

  if (relayDb) {
    return res.status(403).json({ message: 'Relay already exist' });
  }

  // Create new relay and save it
  const newRelay = new Relay({ name, type, Id, product, serial, HID });
  try {
    await newRelay.save();
  } catch(err) {
    return res.status(505).json({ message: 'Error processing the request' });
  }

  return res.status(200).json({ relay: newRelay });
}


module.exports.RelayUpdate = async (req, res) => {
  const { _id, name, type, Id, HID } = req.body;

  if (!_id || !name || !type || !Id || !HID) {
    return res.status(504).json({ message: 'Error processing the request' });
  }

  // Find ralay and update it
  let relay
  let relayDb;
  let open;
  if (type === "Click") {
    open = false;
    try {
      relay = new USBRelay(HID);
      relay.setState(Id, open);
    } catch(err) {
      relay = null
    }
  }
  try {
    relayDb = await Relay.findByIdAndUpdate({ _id }, { name, type, Id, HID, open }, { new: true }).select('-__v'); 
  } catch(err) {
    return res.status(505).json({ message: 'Error processing the request' });
  }

  return res.status(200).json({ relay: relayDb });
}


module.exports.RelayDelete = async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(505).json({ message: 'Error processing the request' });
  }

  // Find ralay and delete it
  const relayDb = await Relay.findByIdAndDelete({ _id }).select('-__v').catch((err) => {
    return res.status(505).json({ message: 'Error processing the request' });
  });

  if (!relayDb) {
    return res.status(403).json({ message: 'Relay not exist' });
  }

  return res.status(200).json({ relay: relayDb });
}

