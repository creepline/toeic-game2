import qrcode

url = 'http://toeic-game-emzych.oss-cn-qingdao.aliyuncs.com/index.html'

# 生成高质量二维码
qr = qrcode.QRCode(
    version=5,  # 更大的尺寸
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=15,  # 更大的像素块
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# 创建图片
img = qr.make_image(fill_color="black", back_color="white")

# 保存为 PNG
img.save('qr-code.png', 'PNG')

print('QR code saved to: qr-code.png')
print(f'URL: {url}')
