const {
  app,
  BrowserWindow,
  protocol,
  systemPreferences,
  Menu,
  Tray,
  ipcMain
} = require('electron')
const rp = require('request-promise');
var fs = require('fs');
const path = require('path');
const {
  SetBottomMost
} = require('electron-bottom-most');
var windows = []
var isDev = false
var url = '';
var htmldata = []
var settings = {}
var styledata = ''
try {
  settings = JSON.parse(fs.readFileSync('assets/settings.json', 'utf8'))
} catch (e) {
  settings = {
    "height": 300,
    "width": 900,
    "PlanURL": "http://plan.elektryk.opole.pl/plany/o1.html",
    "x": 0,
    "y": 0
  }
  fs.writeFileSync('assets/settings.json', JSON.stringify(settings))
} finally {
  url = settings.PlanURL
  ipcMain.on('asynchronous-message', (event, arg) => {
    arg = eval(arg)
    console.log(arg)
    if (arg[2] == 1){
      settings.PlanURL = arg[0]
      windows[1].outerdata.PlanURL = arg[0]
      rp(arg[0])
        .then(function(html) {
      windows[1].setSize(windows[1].getBounds().width, 200)
      windows[1].loadURL('data:text/html;charset=utf-8,' + '<script>var $ = require("jquery")</script><script>$(document).ready(function(){$("a").attr("href", "")})</script><script>$(document).ready(function(){$("a").attr("href", "")})</script><script>$(document).ready(function(){$("html").html($(".tabela").parent().html())})</script><script>$(document).ready(function(){$("a").each(function(){$(this).replaceWith($(`<span>` + $(this).text() + `</span>`))})})</script><script>$(document).ready(function(){$(" th").each(function(){$(this).replaceWith($(`<th>` + unescape($(this).text()) + `</th>`))})})</script><script>$(document).ready(function(){$("span").each(function(){$(this).replaceWith($(`<span>` + unescape($(this).text()) + `</span>`))})})</script><script>$(document).ready(function(){require("electron").ipcRenderer.send(`asynchronous-message`, [null, $("table").outerHeight(), 2])})</script>' + escape((html.toString())))
      windows[1].webContents.on('did-finish-load', function() {
        windows[1].webContents.insertCSS(cssdata)
      event.reply('asynchronous-reply', true)
    })})
    }else{
      windows[1].setSize(windows[1].getBounds().width, arg[1])

    }

  })

  function changeplan() {
    var win = new BrowserWindow({
      width: 600,
      height: 800,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    })
    win.loadFile('assets/index.html')
    win.webContents.on('did-finish-load', function() {
      win.webContents.insertCSS(fs.readFileSync("assets/wyborplan.css", "utf8"))
    })
    win.on('close', function (event) {
      win.hide();
      event.preventDefault();
})
  }

  function createWidget() {
    rp(url)
      .then(function(html) {
        fs.readFile('assets/plan.css', 'utf8', function(err, data) {
          cssdata = data
          var win = new BrowserWindow({
            width: settings.width,
            height: settings.height,
            fullscreenable: false,
            useContentSize: true,
            transparent: !isDev,
            frame: isDev,
            focusable: isDev,
            show: false,
            resizeable: true,
            x: settings.x,
            y: settings.y,
            webPreferences: {
              nodeIntegration: true,
              enableRemoteModule: true
            }
          })
          win.setFullScreenable(false);
          win.setMaximizable(false);
          win.isResizable(false);
          win.setIgnoreMouseEvents(!isDev)
          win.show()
          // win.setIgnoreMouseEvents(true)
          win.loadURL('data:text/html;charset=utf-8,' + '<script>var $ = require("jquery")</script><script>$(document).ready(function(){$("a").attr("href", "")})</script><script>$(document).ready(function(){$("html").html($(".tabela").parent().html())})</script><script>$(document).ready(function(){$("a").each(function(){$(this).replaceWith($(`<span>` + $(this).text() + `</span>`))})})</script><script>$(document).ready(function(){$(" th").each(function(){$(this).replaceWith($(`<th>` + unescape($(this).text()) + `</th>`))})})</script><script>$(document).ready(function(){$("span").each(function(){$(this).replaceWith($(`<span>` + unescape($(this).text()) + `</span>`))})})</script>' + escape((html.toString())))
          win.webContents.on('did-finish-load', function() {
            win.webContents.insertCSS(cssdata)
            // if (nativeTheme.shouldUseDarkColors()) {
            //   const color = systemPreferences.getAccentColor()
            //   win.webContents.insertCSS("body{--color:#"+color+"; --bg:#fff}")
            // } else{
            const color = systemPreferences.getAccentColor()
            win.webContents.insertCSS("body{--color:#" + color + "; --bg:#000}")
            // }
            win.outerdata = {}
            win.outerdata.PlanURL = settings.PlanURL
            windows[1] = win
          })
          let handle = win.getNativeWindowHandle();
          SetBottomMost(handle);
        })
      })
  }

  function closewindowandsave() {
    settings.x = windows[1].getBounds().x
    settings.y = windows[1].getBounds().y
    settings.height = windows[1].getBounds().height
    settings.width = windows[1].getBounds().width
    settings.PlanURL = windows[1].outerdata.PlanURL
    fs.writeFileSync('assets/settings.json', JSON.stringify(settings))
  }

  function createtray() {
    tray = new Tray('assets/E LOGO.png')
    const contextMenu = Menu.buildFromTemplate([{
        label: 'zablokuj',
        type: 'checkbox',
        checked: true,
        click(checked) {
          windows[1].setIgnoreMouseEvents(checked.checked);
          if (checked.checked) {
            let handle = windows[1].getNativeWindowHandle();
            SetBottomMost(handle);
          }
        }
      },
      {
        label: 'zmień Plan',
        type: 'normal',
        click() {
          changeplan();
        }
      },
      {
        label: 'exit',
        type: 'normal',
        click() {
          closewindowandsave();
            app.exit(0);
        }
      },
    ])
    tray.setToolTip('By PRFL')
    tray.setContextMenu(contextMenu)
    windows[0] = tray
  }


  app.whenReady().then(createWidget).then(createtray)


}
