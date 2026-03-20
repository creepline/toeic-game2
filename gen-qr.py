import qrcode

url = 'http://toeic-game-emzych.oss-cn-qingdao.aliyuncs.com/index.html'

# 生成二维码
qr = qrcode.QRCode(version=3, box_size=15, border=4)
qr.add_data(url)
qr.make(fit=True)

# 生成图片
img = qr.make_image(fill_color="black", back_color="white")
img.save('qr.png')

print('OK: qr.png')
print(f'URL: {url}')
