var robot = require('kbm-robot');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(3));
const moment = require('moment');

const LATENCY_MULTIPLIER = 1;
const SCREENSHOT_KEY = '\\';
const SCREEN_CENTER_POSITION = [683, 384];
const SEARCH_FIELD_POSITION = [100, 55];
const SEARCH_BUTTON_POSITION = [95, 380];
const SORT_POSITION = [1060, 33];
const NEXT_PAGE_POSITION = [1310, 405];

const oldSleep = robot.sleep;
const realms = { albion: 1, hibernia: 2, midgard: 3 };

robot.sleep = function(duration, adjustLatency) {
  return oldSleep(duration * (adjustLatency ? LATENCY_MULTIPLIER : 1));
}

function setScreenshotSeries(realm, date, robot) {
  robot
    .typeString(`/sshot ${realm}-${date.format('MM-DD-YY-ha')}`)
    .press('enter');
}

function clear(count, robot) {
  for (var i = 0; i < count; i++) {
    robot.type('BACKSPACE', 2);
  }
}

function interactWithExplorer(robot) {
  robot
    .mouseMove.apply(this, SCREEN_CENTER_POSITION)
    .sleep(500)
    .mouseClick('3')
}

function clearSearchField(robot) {
  robot
    .mouseMove.apply(this, SEARCH_FIELD_POSITION)
    .sleep(100)
    .mouseClick('1')
    .sleep(500)
    .press('END')
    .sleep(500)

  clear(30, robot);
}

function searchForItem(str, robot) {
  robot
    .typeString(str)
    .sleep(1000)
    .mouseMove.apply(this, SEARCH_BUTTON_POSITION)
    .sleep(100)
    .mouseClick('1')
}


function nextPage(robot) {
  robot
    .mouseMove.apply(this, NEXT_PAGE_POSITION)
    .mouseClick('1')
    .sleep(1000, true)
}

function screenshotPages(pages, robot) {
  for(var i = 0; i < pages; i++) {
    robot
      // sort twice for ascending
      .mouseMove.apply(this, SORT_POSITION)
      .sleep(100)
      .mouseClick('1')
      .sleep(1000, true)
      .mouseClick('1')
      .sleep(1000, true)

      // screenshot
      .press(SCREENSHOT_KEY)
      .sleep(1000)

    if (pages > 0 && i < pages - 1) {
      // move to next page and click
      nextPage(robot);
    }
  }
}

robot.startJar();

robot.sleep(2500);

setScreenshotSeries(argv.realm, moment(), robot);

robot.sleep(2500);

const items = fs.readFileSync('items/all.txt').toString().split('\r\n');

items.forEach(function(item) {
  const arr = item.split(",");
  const name = arr[0];
  const pages = parseInt(arr[realms[argv.realm]], 10);
  if (pages) {
    interactWithExplorer(robot)
    robot.sleep(1000)
    clearSearchField(robot)
    robot.sleep(100)
    searchForItem(name, robot)
    robot.sleep(1000)
    screenshotPages(pages, robot)
    robot.sleep(1000)
  }
});

robot.go(robot.stopJar);
