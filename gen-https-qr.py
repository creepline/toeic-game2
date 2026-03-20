import qrcode

url = 'https://toeic-game-emzych.oss-cn-qingdao.aliyuncs.com/index.html'

qr = qrcode.QRCode(version=3, box_size=15, border=4)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="black", back_color="white")
img.save('qr-https.png')

print('OK: qr-https.png')
print(f'URL: {url}')
