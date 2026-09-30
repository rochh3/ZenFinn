const supabase = require('../config/supabase');

exports.getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { couple_group_id, name, icon_name, color } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ couple_group_id, name, icon_name, color }])
      .select();
      
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.archiveCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Logical deletion as specified in the document
    const { data, error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
