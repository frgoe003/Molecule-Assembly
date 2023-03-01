
import numpy as np
import matplotlib.pyplot as plt
import statsmodels.api as sm
import random
import math 
import collections


np.random.seed(2021)

input="ATGCATCTATATATATACGATCATGCAT"
data=[]
dic=collections.defaultdict(lambda: [0,0]) # dic[0] for mid, dic[1] for edge cases

#stats
z=1.96

input_length=len(input)


n = input_length-1 #number of links between letters

N_hat = 150000 #number of trials

Π = (n+2)*(2**(n-1))-1 #total number of fragments possible

Π_hat = 0 #total number of fragments encountered

for i in range(N_hat):
    tmp=""
    start=0
    for i in range(input_length):
        tmp+=input[i]
        if random.getrandbits(1):
            Π_hat+=1
            if 0<i<input_length-1 and 0<start<input_length-1:
                dic[tmp][0]+=1
            else:
                dic[tmp][1]+=1

            tmp=""
            start = i+1

    if tmp:
        Π_hat+=1
        dic[tmp][1]+=1

wS={}

for key in dic.keys():

    l=len(key)-1
    M_a = 2**(n-l-1)
    M_b = 2**(n-l-2)

    pa = (dic[key][1]+(z**2)/2)/(Π_hat+(z**2))
    pb = (dic[key][0]+(z**2)/2)/(Π_hat+(z**2))

    w= (Π/M_a)*pa+ (Π/M_b)*pb

    s1=(Π/M_a)*(z/(Π_hat+z**2))*math.sqrt((dic[key][1]*(Π_hat-dic[key][1]))/Π_hat+(z**2)/4)
    s2=(Π/M_b)*(z/(Π_hat+z**2))*math.sqrt((dic[key][0]*(Π_hat-dic[key][0]))/Π_hat+(z**2)/4)

    sigma= math.sqrt(s1**2+s2**2)

    if sigma>0.05 or w<1.5:
        continue
    wS[key]=w

sort=sorted(zip(wS.keys(),wS.values()), key=lambda x: -x[1])

X = [x[0] for x in sort]
Y = [x[1] for x in sort]

plt.bar(X,Y)
plt.show()
