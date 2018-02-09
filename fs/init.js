/**
using my mjs-pwm project
*/

load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load('api_rpc.js');
load('api_pwm.js');

let led = 2;//Cfg.get('pins.led');


/**
 * Motion detector block
 * */
let mov_pin = 12; //movement sensor pin
let led_tape=5; //light control pin
let mvm=0; //movement detected
let led_mode=0; //<0 0 >0 for OFF/by sensor/ON
let counter=0; //time counter

GPIO.set_mode(mov_pin, GPIO.MODE_INPUT);
GPIO.set_pull(mov_pin, GPIO.PULL_NONE); //no pull down in esp8266
GPIO.set_mode(led_tape, GPIO.MODE_OUTPUT);

GPIO.write(led_tape,0);
//by timer, not by interrupt, so we can make some time-based handling: delay or slow dimming if use pwm
Timer.set(500 , true , function() {
  mvm=GPIO.read(mov_pin);
  if (led_mode!==0) return;
  if(mvm===1) {  
      GPIO.write(led_tape,1);
      //PWM.set(led_tape, 100, counter/3000);
  } else {
      //PWM.set(led_tape, 100, 1.0-counter/10000);
      GPIO.write(led_tape,0);
  }
}, null);

RPC.addHandler('mvm', function(args) {
    return mvm;
});

RPC.addHandler('led', function(args) {
    if (typeof(args) === 'object' && typeof(args.mode) === 'number') {
      led_mode=args.mode;
      if (led_mode>0) GPIO.write(led_tape,1);
      if (led_mode<0) GPIO.write(led_tape,0);
    }
    return led_mode;
});
