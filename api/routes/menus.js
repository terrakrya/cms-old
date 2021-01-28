const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const slugify = require('slugify')
const auth = require('../config/auth')
const Menu = mongoose.model('Menu')

router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find({}).populate(req.query.populate).sort('name')
    res.json(menus)
  } catch (err) {
    res.status(422).send(err.message)
  }
})

router.get('/submenus', async (req, res) => {
  try {
    const menus = (await Menu.find({ menu: null }).populate(req.query.populate).sort('name')).map(menu => {
      return {
        _id: menu._id.toString(),
        name: menu.name,
        slug: menu.slug,
        url: menu.url || ''
      }
    })

    for (let i = 0; i < menus.length; i++) {
      const submenus = (await Menu.find({ menu: menus[i]._id }).populate(req.query.populate).sort('name')).map(menu => {
        return {
          _id: menu._id.toString(),
          name: menu.name,
          slug: menu.slug,
          url: menu.url || ''
        }
      })

      if (submenus) {
        menus[i].submenus = submenus
      }
    }
    res.json(menus)
  } catch (err) {
    res.status(422).json(err.message)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findOne({ slug: req.params.id })
    res.json(menu)
  } catch (err) {
    res.status(422).send(err.message)
  }
})

router.post('/', auth.admin, (req, res) => {
  const newMenu = new Menu(req.body)
  newMenu.site = req.payload.site
  newMenu.slug = slugify(newMenu.name).toLowerCase()
  newMenu.url = req.payload.url

  newMenu.save((err, menu) => {
    if (err) {
      res.status(422).send(err.message)
    } else {
      res.send(menu)
    }
  })
})

router.put('/:id', auth.admin, (req, res) => {
  const params = req.body
  params.slug = slugify(params.name).toLowerCase()

  Menu.findOneAndUpdate({
    slug: req.params.id
  }, {
    $set: params
  }, {
    upsert: true
  }, (err, menu) => {
    if (err) {
      res.status(422).send(err.message)
    } else {
      res.send(menu)
    }
  })
})

router.delete('/:id', auth.admin, (req, res) => {
  Menu.findOne({
    slug: req.params.id
  }).populate('projects').exec((err, menu) => {
    if (err) {
      res.status(422).send(err.message)
    } else if (menu.projects && menu.projects.length) {
      res.status(422).send('Não é possível excluír! Existem projetos cadastrados nesta linha de ação')
    } else {
      menu.remove()
      res.send(menu)
    }
  })
})

module.exports = router
