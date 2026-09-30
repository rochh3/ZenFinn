const supabase = require('../config/supabase');

exports.getTransactions = async (req, res) => {
  try {
    // Ideally filter by user's couple_group_id
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .order('date', { ascending: false });
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { couple_group_id, category_id, amount, transaction_type, recurrence_type, date, note, source } = req.body;
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          couple_group_id,
          user_id: req.user.id,
          category_id,
          amount,
          transaction_type,
          recurrence_type,
          date,
          note,
          source: source || 'app'
        }
      ])
      .select();
      
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
