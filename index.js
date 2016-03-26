var robot = require('kbm-robot');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(3));

const LATENCY_MULTIPLIER = 1;
const SCREENSHOT_KEY = '\\';
const SCREEN_CENTER_POSITION = [960, 540];
const SEARCH_FIELD_POSITION = [100, 55];
const SEARCH_BUTTON_POSITION = [165, 420];
const SORT_POSITION = [75, 470];
const NEXT_PAGE_POSITION = [330, 840];

robot.oldSleep = robot.sleep;

robot.latencySleep = function(duration) {
  return robot.sleep(duration * LATENCY_MULTIPLIER);
}

robot.clear = function(count) {
  for (var i = 0; i < count; i++) {
    this.press('BACKSPACE');
  }
  return this;
}

robot.interactWithExplorer = function() {
  return this
    .mouseMove.apply(this, SCREEN_CENTER_POSITION)
    .sleep(500)
    .mouseClick('3')
}

robot.clearSearchField = function() {
  return this
    .mouseMove.apply(this, SEARCH_FIELD_POSITION)
    .sleep(100)
    .mouseClick('1')
    .sleep(500)
    .press('END')
    .sleep(500)
    .clear(1000)
}

robot.searchForItem = function(str) {
  return this
    .typeString(str)
    .sleep(1000)
    .mouseMove.apply(this, SEARCH_BUTTON_POSITION)
    .sleep(100)
    .mouseClick('1')
}

robot.screenshotPages = function() {
  for(var i = 0; i < 2; i++) {
    this
      // sort twice for ascending
      .mouseMove.apply(this, SORT_POSITION)
      .sleep(100)
      .mouseClick('1')
      .latencySleep(1000)
      .mouseClick('1')
      .latencySleep(1000)

      // screenshot
      .press(SCREENSHOT_KEY)
      .sleep(1000)

      // move to next page and click
      .mouseMove.apply(this, NEXT_PAGE_POSITION)
      .mouseClick('1')
      .latencySleep(1000)
  }

  return this;
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
  robot = robot
  .interactWithExplorer()
  .sleep(1000)
  .clearSearchField()
  .sleep(1000)
  .searchForItem(item)
  .sleep(1000)
  .screenshotPages()
  .sleep(1000)
});

robot.go(robot.stopJar);
