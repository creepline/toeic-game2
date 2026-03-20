import qrcode
from PIL import Image

url = 'http://toeic-game-emzych.oss-cn-qingdao.aliyuncs.com/index.html'

# 生成标准二维码
qr = qrcode.QRCode(
    version=3,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=20,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# 生成图片
img = qr.make_image(fill_color="black", back_color="white")

# 保存
img.save('qr-final.png')
print('Saved: qr-final.png')
print(f'URL: {url}')

# 验证
from pyzbar import pyzbar
import cv2
import numpy as np

# 读取并验证
img_cv = cv2.imread('qr-final.png')
decoded = pyzbar.decode(img_cv)

if decoded:
    print(f'\nVerified! Content: {decoded[0].data.decode()}')
else:
    print('\nWarning: Could not verify QR code')
