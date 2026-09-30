const supabase = require('../config/supabase');

exports.getBudgets = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*, categories(*)');
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { couple_group_id, category_id, amount_limit, period, start_date, end_date } = req.body;
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([{ couple_group_id, category_id, amount_limit, period, start_date, end_date }])
      .select();
      
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
