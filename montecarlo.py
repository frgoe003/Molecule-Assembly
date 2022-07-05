
import numpy as np
import matplotlib.pyplot as plt
import statsmodels.api as sm
import random
import math 
import collections
np.random.seed(2021)


input="CUCGACGACUAUCUCGACAAUGAC"
data=[]
dic=collections.defaultdict(lambda: [0,0]) # dic[0] for mid, dic[1] for edge cases

#stats
z=1.96


input_length=len(input)
N_hat=0
Π = (input_length-1+2)*(2**(input_length-2))-1


for i in range(10000):
    tmp=""
    N_fragE=0
    start=0
    for i in range(input_length):
        s=input[i]
        tmp+=s
        if bool(random.getrandbits(1)):
            
            N_hat+=1;N_fragE+=1

            if 0<i<input_length and 0<start<input_length:
                dic[tmp][0]+=1
            else:
                dic[tmp][1]+=1

            start=i+1
            tmp=""
    if tmp:
        if 0<i<input_length and i<start<input_length:
            dic[tmp][1]+=1
        else:
            dic[tmp][0]+=1


wS={}

for key in dic.keys():

    l=len(key)-1
    M_a=2**(input_length-1-l-1)
    M_b=2**(input_length-1-l-2)

    w= (Π/M_a)*(dic[key][1]+(z**2)/2)/(N_hat+(z**2))+ (Π/M_b)*(dic[key][0]+(z**2)/2)/(N_hat+(z**2))

    s1=(Π/M_a)*(z/(N_hat+z**2))*math.sqrt((dic[key][1]*(N_hat-dic[key][1]))/N_hat+(z**2)/4)
    s2=(Π/M_b)*(z/(N_hat+z**2))*math.sqrt((dic[key][0]*(N_hat-dic[key][0]))/N_hat+(z**2)/4)

    sigma= math.sqrt(s1**2+s2**2)

    if sigma>0.05:
        continue
    wS[key]=w

sort=sorted(wS.items(), key=lambda x: x[1])


plt.bar(wS.keys(),wS.values())
plt.show()

"""
mu = 0 
sigma = 1 
n = 100 
# assumed population parameters
alpha = np.repeat(0.5, n)
beta = 1.5

def MC_estimation_slope(M):
    MC_betas = []
    MC_samples = {}

    for i in range(M):
        # randomly sampling from normal distribution as error terms
        e = np.random.normal(mu, sigma, n)
        # generating independent variable by making sure the variance in X is larger than the variance in error terms
        X = 9 * np.random.normal(mu, sigma, n)
        # population distribution using the assumd parameter values alpha/beta
        Y = (alpha + beta * X + e)
        
        # running OLS regression for getting slope parameters
        model = sm.OLS(Y.reshape((-1, 1)), X.reshape((-1, 1)))
        ols_result = model.fit()
        coeff = ols_result.params
        
        MC_samples[i] = Y
        MC_betas.append(coeff)
    MC_beta_hats = np.array(MC_betas).flatten()
    return(MC_samples, MC_beta_hats)
    
MC_samples, MC_beta_hats = MC_estimation_slope(M = 10000)
beta_hat_MC = np.mean(MC_beta_hats)



import matplotlib.pyplot as plt

counts, bins, ignored  = plt.hist(MC_beta_hats, 20, density = True, color = 'purple', label = 'MC sampling beta')
plt.title("Monte Carlo Simulation for LR beta estimate M = 10000")
plt.axvline(beta, 0,40, color = 'y', label = 'Population beta')
plt.xlabel("beta")
plt.ylabel("Probability")
plt.legend()
plt.show()
"""