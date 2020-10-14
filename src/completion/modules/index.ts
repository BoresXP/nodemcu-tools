import { adc } from './adc'
import { am2320 } from './am2320'
import { apa102 } from './apa102'
import { bit } from './bit'
import { bme280 } from './bme280'
import { bmp085 } from './bmp085'
import { cjson } from './cjson'
import { coap } from './coap'
import { crypto } from './crypto'
import { dht } from './dht'
import { encoder } from './encoder'
import { enduser_setup } from './enduser_setup'
import { file } from './file'
import { gpio } from './gpio'
import { http } from './http'
import { hx711 } from './hx711'
import { i2c } from './i2c'
import { mdns } from './mdns'
import { mqtt } from './mqtt'
import { net } from './net'
import { node } from './node'
import { ow } from './ow'
import { perf } from './perf'
import { pwm } from './pwm'
import { rotary } from './rotary'
import { rtcfifo } from './rtcfifo'
import { rtcmem } from './rtcmem'
import { rtctime } from './rtctime'
import { sigma_delta } from './sigma_delta'
import { sntp } from './sntp'
import { spi } from './spi'
import { struct } from './struct'
import { tmr } from './tmr'
import { tsl2561 } from './tsl2561'
import { uart } from './uart'
import { wifi } from './wifi'
import { ws2801 } from './ws2801'
import { ws2812 } from './ws2812'

const allModules = {
	adc,
	am2320,
	apa102,
	bit,
	bme280,
	bmp085,
	cjson,
	coap,
	crypto,
	dht,
	encoder,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	enduser_setup,
	file,
	gpio,
	http,
	hx711,
	i2c,
	mdns,
	mqtt,
	net,
	node,
	ow,
	perf,
	pwm,
	rotary,
	rtcfifo,
	rtcmem,
	rtctime,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	sigma_delta,
	sntp,
	spi,
	struct,
	tmr,
	tsl2561,
	uart,
	wifi,
	ws2801,
	ws2812,
}

export default allModules
