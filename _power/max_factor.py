# https://blog.csdn.net/Yuki_fx/article/details/115103663
# https://oi-wiki.org/math/number-theory/pollard-rho/
def max_prime_factor(n):
    # 初始化最大素因子
    max_prime = -1
    # 处理2这个素因子
    while n % 2 == 0:
        max_prime = 2
        n //= 2
    # 处理其他奇数素因子
    for i in range(3, int(n**0.5) + 1, 2):
        while n % i == 0:
            max_prime = i
            print("发现素因子:\n", i, "\n")
        n //= i
    # 如果n是一个大于2的素数
    if n > 2:
        max_prime = n
    return max_prime

number = 2**(2**32)+1
print(number)
# print("最大素因子是:", max_prime_factor(number))
