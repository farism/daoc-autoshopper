var robot = require('kbm-robot');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(3));

const LATENCY_MULTIPLIER = 1;
const SCREENSHOT_KEY = '\\';
const SCREEN_CENTER_POSITION = [683, 384];
const SEARCH_FIELD_POSITION = [100, 55];
const SEARCH_BUTTON_POSITION = [95, 380];
const SORT_POSITION = [1060, 33];
const NEXT_PAGE_POSITION = [1310, 405];

const oldSleep = robot.sleep;

robot.sleep = function(duration, adjustLatency) {
  return oldSleep(duration * (adjustLatency ? LATENCY_MULTIPLIER : 1));
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

function screenshotPages(robot) {
  for(var i = 0; i < 2; i++) {
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

      // move to next page and click
      .mouseMove.apply(this, NEXT_PAGE_POSITION)
      .mouseClick('1')
      
      .sleep(1000, true)
  }
}

function readItems() {
  return [].reduce.call(arguments, function(acc, path){
    return acc.concat(fs.readFileSync(path).toString().split('\r\n'));
  }, []);
}

const items = readItems(
  'items/all.txt',
  `items/${argv.realm}.txt`
).filter(function(item){ return item });

robot.startJar();

robot.sleep(5000);

items.forEach(function(item) {
  interactWithExplorer(robot)
  robot.sleep(1000)
  clearSearchField(robot)
  robot.sleep(1000)
  searchForItem(item, robot)
  robot.sleep(1000)
  screenshotPages(robot)
  robot.sleep(1000)
});

robot.go(robot.stopJar);
