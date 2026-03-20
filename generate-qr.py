import qrcode

url = 'http://toeic-game-emzych.oss-cn-qingdao.aliyuncs.com/index.html'

# 生成二维码
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# 创建二维码图片
img = qr.make_image(fill_color="black", back_color="white")

# 保存
img.save('qr-code.png')
print('OK: QR code generated: qr-code.png')
print(f'URL: {url}')
print('Scan with phone to access')
