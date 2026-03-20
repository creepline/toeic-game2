import qrcode

url = 'https://toeic-game-tau.vercel.app'

qr = qrcode.QRCode(version=3, box_size=15, border=4)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="black", back_color="white")
img.save('qr-vercel.png')

print('OK: qr-vercel.png')
print(f'URL: {url}')
