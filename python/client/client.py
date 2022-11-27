from ftplib import FTP

ftp = FTP()  # connect to host, default port
ftp.connect('0.0.0.0', 2121)
ftp.login("myuser", "123456789")  # user anonymous, passwd anonymous@

ftp.quit()
