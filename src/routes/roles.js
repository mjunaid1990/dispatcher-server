const express = require('express');
const router = express.Router();
const { Role, User } = require('../models');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({}).sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single role
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new role
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, permissions, isSystem } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const role = new Role({
      name,
      slug: slug.toLowerCase(),
      description,
      permissions: permissions || [],
      isSystem: isSystem || false,
    });

    await role.save();
    res.status(201).json(role);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Role with this name or slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const { name, description, permissions, isActive } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent modifying system roles
    if (role.isSystem) {
      return res.status(403).json({ error: 'Cannot modify system roles' });
    }

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions !== undefined) role.permissions = permissions;
    if (isActive !== undefined) role.isActive = isActive;

    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(403).json({ error: 'Cannot delete system roles' });
    }

    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ role: role.slug });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role assigned to users',
        count: usersWithRole 
      });
    }

    await Role.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign role to user
router.post('/assign/:userId', async (req, res) => {
  try {
    const { roleId } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: role.slug },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users by role
router.get('/:roleId/users', async (req, res) => {
  try {
    const role = await Role.findById(req.params.roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const users = await User.find({ role: role.slug })
      .select('name email phone role isActive createdAt')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
