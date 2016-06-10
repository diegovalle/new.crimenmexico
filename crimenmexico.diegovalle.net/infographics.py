# coding: utf-8

import glob
from datetime import datetime
import os
import re
import locale


def clean(lang, t):
    locale.setlocale(locale.LC_TIME, t)
    os.system(r"find " + lang + "images/infographics/fulls -name '*.png' -exec sh -c 'convert {} -resize 30% " + lang + r"images/infographics/thumbnails/$(basename "+ r'"{}"' + r")' \;")

    # find './images/infographics/fulls' -name '*.png' -exec sh -c 'convert {} -resize 30% images/infographics/thumbnails/$(basename "{}")' \;

    files_mun = glob.glob(lang + "images/infographics/thumbnails/mun*.png")
    # import pdb;pdb.set_trace()
    if lang == "en/":
        file = lang + 'images/infographics/thumbnails/municipios_%b_%Y.png'
    else:
        file = lang + 'images/infographics/thumbnails/municipios_es_%b_%Y.png'
    files_mun = sorted(files_mun, key=lambda x: str(datetime.strptime(x, file)))
    files_mun.reverse()

    files_inf = glob.glob(lang + "images/infographics/thumbnails/inf*.png")
    files_inf = sorted(files_inf, key=lambda x: str(datetime.strptime(x, file.replace('municipios', 'infographic'))))
    files_inf.reverse()

    dates = map(lambda x: datetime.strptime(x, file.replace('municipios', 'infographic'))
                .strftime('%B %Y'), files_inf)

    s = ''
    for i in range(0, len(files_mun)):
        s += '''<p>{0}</p><div class="row">

                                                                        <div class="6u 12u(mobile)"><a href="/{1}" class=" fit"><img class="lazy" data-original="/{2}" alt=""></a></div>
                                                                        <div class="6u 12u(mobile)"><a href="/{3}" class=" fit"><img src="/{4}" alt=""></a></div>
                                                                </div> '''.format(dates[i], files_inf[i].replace('thumbnails', 'fulls'), files_inf[i], files_mun[i].replace(                        'thumbnails', 'fulls'), files_mun[i])

    # locale.setlocale(locale.LC_ALL, "pt_PT")

    f = open(lang + 'infographics.template', 'r')
    filedata = f.read()
    f.close()

    newdata = filedata.replace("{{INFOGRAPHICS}}", s)

    f = open(lang + 'infographics.html','w')
    f.write(newdata)
    f.close()



    f = open(lang + 'index.html','r')
    filedata = f.read()
    f.close()

    newdata = re.sub(r'href="/[a-z]+/images/infographics/fulls/infographic_[a-z_]+_[0-9]+.png"',
                     'href="/' + files_inf[0].replace('thumbnails', 'fulls') + '"', filedata)
    newdata = re.sub(r'src="/[a-z]+/images/infographics/thumbnails/infographic_[a-z_]+_[0-9]+.png"',
                    'src="/' +  files_inf[0] + '"', newdata)
    newdata = re.sub(r'href="/[a-z]+/images/infographics/fulls/municipios_[a-z_]+_[0-9]+.png"',
                     'href="/' + files_mun[0].replace('thumbnails','fulls') + '"', newdata)
    newdata = re.sub(r'src="/[a-z]+/images/infographics/thumbnails/municipios_[a-z_]+_[0-9]+.png"',
                     'src="/' + files_mun[0] + '"', newdata)
    # newdata = filedata.replace("{{INFOGRAPHICS}}", s)

    f = open(lang + 'index.html', 'w')
    f.write(newdata)
    f.close()

    f = open(lang + 'municipios-map.html','r')
    filedata = f.read()
    f.close()

    newdata = re.sub('Map of homicide in Mexico [a-zA-Z0-9 ]*',r'Map of homicide in Mexico from ' + datetime.strftime(monthdelta(datetime.strptime(dates[0], "%B %Y"), -5), "%B %Y") + ' to ' + dates[0], filedata)
    newdata = re.sub('Mapa de homicidios [a-zA-Z0-9 úÚ]*',
                     r'Mapa de homicidios de ' + datetime.strftime(monthdelta(datetime.strptime(dates[0], "%B %Y"), -5), "%B %Y") + ' a ' + dates[0], newdata)
    # import pdb;pdb.set_trace()

    f = open(lang + 'municipios-map.html', 'w')
    f.write(newdata)
    f.close()

def monthdelta(date, delta):
    m, y = (date.month+delta) % 12, date.year + ((date.month)+delta-1) // 12
    if not m: m = 12
    d = min(date.day, [31,
        29 if y%4==0 and not y%400==0 else 28,31,30,31,30,31,31,30,31,30,31][m-1])
    return date.replace(day=d,month=m, year=y)

clean('en/', "C")
clean('es/', 'es_ES.UTF-8')
os.system(r"find . -name '*.png' -exec sh -c 'optipng {}' \;")
os.system(r"cd assets/json; rm *.gz;gzip -k -f *")
