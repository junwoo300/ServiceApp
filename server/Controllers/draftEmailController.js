const DraftEmail = require('../Models/DraftEmail');

// Create new draft
exports.createDraft = async (req, res) => {
  try {
    const draft = new DraftEmail(req.body);
    await draft.save();
    res.status(201).json(draft);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all drafts
exports.getAllDrafts = async (req, res) => {
  try {
    const drafts = await DraftEmail.find();
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single draft
exports.getDraftById = async (req, res) => {
  try {
    const draft = await DraftEmail.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update draft
exports.updateDraft = async (req, res) => {
  try {
    const updatedDraft = await DraftEmail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedDraft);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete draft
exports.deleteDraft = async (req, res) => {
  try {
    await DraftEmail.findByIdAndDelete(req.params.id);
    res.json({ message: 'Draft deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
