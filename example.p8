pico-8 cartridge // http://www.pico-8.com
version 16
__lua__
-- from: https://www.lexaloffle.com/pico-8.php?page=manual
t = 0
function _draw()
 cls(5)
 for i=0,7 do
  val = 0
  if (i%2 == flr(t)%3) then
   val = 255
  end
  poke(0x5f80 + i, val)
  circfill(20+i*12,64,4,val/11)
  print(i,19+i*12,52,14)
 end
 t += 0.1
end
