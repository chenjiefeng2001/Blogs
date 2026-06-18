---
title: "The Art of MultiProcessor"
date: "2026-06-14"
summary: "采用全自动化的脚本扫描，以后只要丢入 Markdown 文件，网站就会自动更新。"
tags: ["Hardware", "C"]
---

# The Art of Multiprocessor Programming

本书主要是提供了一种多线程编程的参考书

第一部分：第一部分只包含简要的介绍和讨论，如果需要快速阅读应该跳转到第二部分开始。	

第二章——*互斥问题的简要介绍*

第三章——*并发程序的正确性的含义*

*任何想要真正精通多处理器编程艺术的人都应该花时间解决本书的第一部分提出的问题*——尽管这些问题是理想化的，但是它们提炼了编写有效多处理器程序所需的思维方式。最重要的是：**它们提炼了避免新手程序员在初次接触并发犯下的常见错误的必要思维方式**。

第二部分介绍了并发编程的实践。（如果可行应该改为C++，这才是更适合处理并发模型的编程语言)

在这部分每一张都有一个次要主题，说明特定的编程模式或者算法技术。

- 第七章涵盖了**自旋锁**和**争用**——并且介绍了底层架构的重要性：*不理解多处理器内存层次的结构*
- 第八章涵盖了**监视锁**和**等待**——这是一个常见的同步模式
- 第九章到第十五章涵盖了并发数据结构
  1. 第九章为链表，并展示不同种类的同步模式
  2. 第十章为ABA问题的讨论
  3. 第十一章主要围绕堆栈称为消除的重要的同步模式
  4. 第十二章和第十三章展示了使用哈希表的算法如何利用自然并行性
  5. 第十四章对跳表进行了说明——使用跳表能高效地并行搜索
  6. 第十五章讨论优先队列——在某些情况下可以通过放宽正确性的保证来提升性能。

## 第一章 引言

多核芯片通过利用并行性来使计算更高效：*利用多个处理器来处理单个任务*

多处理器架构的普及对我们如何开发软件产生了深远影响

本书的重点：介绍如何通过共享内存进行通信的多处理器进行编程。(即在共享内存多处理器上进行开发)

现代计算机在本质上是非同步的：*中断、抢占、缓存未命中、故障和其他事件可能会导致在没有任何警告的情况下中止/延迟活动*

###### 本书将会从两个互补的方向来研究多处理器编程：**原理和实践**

原理部分关注的是可计算性：*确定在异步并发环境中我们可以做什么*(补充材料：计算理论导引)

在理解可计算性的重要步骤之一，是规范说明和验证给定程序实际所做的工作。

顺序的正确性主要关注安全属性。安全属性是指**某些“坏事”永远不会发生**。并发正确性也关注安全，但问题要困难得多，因为必须保证安全，尽管并发线程的步骤可以交错的形式非常多。同样重要的是，并发正确性包含了一系列在顺序世界中没有对应属性的活性属性(指的是特定的好事终究会发生)

本书的关于原理的部分的最终目标之一：介绍多种用于推理并发程序的指标和方法

第二部分讨论多处理器程序的时间，并且侧重性能。分析多处理器算法的性能，其风格也与分析顺序的性能不同哦弄个。

绝大部分情况下，本书的代码都是C++(但是本篇文章一般情况都会将其转述为C/C++,过于简化的虚拟机层次会导致理解有问题)

### 1.1 共享对象和同步

在很多时候，你设置相等的工作量并不代表实际上会有相同的工作量。本书中举了一个很经典的例子——采用并行程序找出从1到$10^5$之间的所有质数

问题的核心在于：**增加计数器值需要共享变量执行两个不同的操作：将值字段读入临时变量，并将其写回Counter对象**

从实际角度上来看，你不太可能需要自己设计一个互斥算法。然而，理解如何基础实现互斥是理解并发运算的一般本质的必要条件。

如何实现协调协议？

### 互斥协议的性质

互斥属性，包含有无死锁属性——只要决定执行操作，那么必定会有一个会执行成功。另一个值得关注的特性是无饥饿性：即并发程序中的一方一直占用资源不释放导致其他的因为无法获取到该资源从而产生饥饿

还需要注意等待属性——这个属性包含了容错性的例子。

### 道德

在并发系统中，有两种通信是自然发生的：

1. 瞬时通信：*需要双方参与*
2. 持久通信：允许发送者和接收者在不同的时间参与

而对于互斥来说，其必须保证通信是持久通信——否则会出现瞬时可以满足条件，但是持久时不满足。并且发送端无法知道其他的是否已经使用完毕——从而导致锁死

*两个线程之间的互斥可以通过仅使用两个一位变量来解决(并非完美的解决方案)，每一个变量可以被一个线程写入，并且由另一个线程读取*。

### 生产者——消费者问题

生产者——消费者问题几乎总是出现在所有并行和分布式系统中。它是线程将数据放置在通信缓冲区的形式，以便在跨网络互联或者共享总线中进行读取/传输。

### 读者——写者问题

can-and-string协议

因为互斥和生产者-消费者协议都需要等待，这在共享内存多处理器环境中，读者-写者问题的解决方案是**一种允许线程捕获多个内存位置瞬时视图的方法**——在不等待的情况下捕获这种视图。

### 并行化的残酷现实

阿姆达尔定律：我们能够加速任何复杂任务的程度，受限于必须顺序执行的任务比例。

> 定义一个任务的加速比为$s$为单处理器完成该任务的所需时间与$n$多处理器完成相同任务的所需时间的比值。该定律描述了一个通过n处理器协作运行一个应用程序所能达到的最大加速比$S$，其中$p$是可以并行执行的任务部分的比例。
>
> 并行化计算需要时间：
> $$
> 1-p+\frac{p}{n}
> $$
> 则最大加速比：
> $$
> S=\frac{1}{1-p+\frac{p}{n}}
> $$
> 

这个最大的加速比存在的情况是不进行协调让其他线程帮助完成的情况。

理解允许程序员有效地编程需要协调和同步的代码部分工具和技术，因为这些部分带来的收益可能对性能产生深远影响。

重要的是要最小化顺序代码的粒度，在这种情况下，使用互斥访问代码。此外，以有效的方式实现互斥也很重要，*因为围绕互斥共享计数器的通信和协调都会显著影响我们的整个程序的性能*

### 并行编程

对于我们希望并行化的许多应用程序，其显著部分可以很容易地确定为可并行执行，因为它们不需要任何形式地协调或者通信。

## 第二章 互斥

互斥可能是多处理器编程中最普遍的协调形式。本章涵盖了通过读写共享内存工作地经典互斥算法。尽管目前来说这些算法已经没有实际的使用价值——在很多情况下是用不到的，但是它们能够帮助我们更好的理解并行编程

### 时间和事件

推理并发计算主要就是**推理时间**——有的时候我们希望事情同时发生，有时我们希望它们在不同的时间上发生。

为了进一步讨论，本书引入了一些简单的词汇和符号来进行描述——状态机相关(补充资料：*Introduction to Computational Theory*)

首先，事件是瞬时的：发生在单一事件的时间瞬间。这里要求不同事件永不同时发生是合理的：不同的事件发生在不同的时间

$a_0\rightarrow a_1$：表示$a_0$和$a_1$之间的持续时间

如果$a_1\rightarrow b_0$，则区间$I_A$先于$I_B$，记作$I_A\rightarrow I_B$。$\rightarrow$关系是区间上的偏函数。由$\rightarrow$定义的无关的区间被称之为并发。

### 临界区

临界区是一段一次只能由一个线程执行的代码块——这种属性也被称之为**互斥**。

实现互斥的标准方法是通过一个满足锁属性的接口实现：

```c++
class Interface{
     public:
    	void lock();		//进入临界区
         void unlock();		//离开临界区
}
```

```c++
class Counter{
    public:
    	long getAndIncrement(){
            lock.lock();		//进入临界区
            try{
                long temp *value;	//临界区内操作
                value=temp+1;	//临界区内操作
                return temp;
      
            }
            lock.unlock();	//离开临界区
        }
    
}
```

上述的互斥模型在一定程度上保证了线程安全。如果线程符合以下的条件，则可以认为是良好的格式：

1. 每个临界区都与一个锁对象相关联
2. 当线程想要进入临界区时，会调用该对象的`lock()`方法
3. 当线程离开临界区时，会调用`unlock()`方法

线程持有该锁：当一个线程从`lock()`方法调用返回时获取到一个锁，并且当它调用`unlock()`方法时释放该锁。如果一个线程已经获取了锁并且没有随后释放它，那么则说该线程持有该锁。

*当任何其他线程持有锁时，没有另外的线程可以获取到该锁*。——只允许至多一个线程在任何时候持有该锁。

如果有线程持有它，则说该锁是**忙**的，否则则说该锁是**空闲**的。

多个临界区可以与同一个锁相关联，在这种情况下，当任何其他线程正在执行与同一个锁相关联的临界区时，没有其他线程可以执行相关的临界区。

现在我们将会更详细的描述一个锁应该具有的性质：

1. 互斥 在任何时候至多存在一个线程持有该锁

2. 避免死锁 如果一个线程正在尝试获取或者释放该锁，那么最终会有某个线程获取/释放锁。如果一个线程调用`lock()`方法，并且永不返回，那么其他线程必须完成无限多个临界区。

3. 饥饿自由 每个尝试获取/释放锁的线程最终都会成功。

   > 这里的无饥饿意味着无死锁

无死锁特性很重要——无死锁意味着系统永远不会“冻结”。

无饥饿特性，虽然很显然时理想的，但却是三种特性中最不吸引人的(这种特性也被称之为锁闭性)因为并不是所有的并行都会产生饥饿

**学会推理饥饿的能力对于理解它是否是一个现实的威胁是至关重要的**

无饥饿属性在某种程度上来说也是弱的——因为没有保证任何线程在进入临界区时需要等待多久。

### 双线程解决方案

现在考虑两个线程互斥问题，我们两个线程锁算法遵循以下的约定：

1. 线程具有ID:0和1
2. 线程可以通过调用`ThreadID.get()`来获取其ID
3. 将调用线程的ID存储在i中，将另一个现成的ID存储在j=1-i中

接下来讨论两个不算完善但是很有趣的算法：

#### 单锁

```c++
#include <atomic>
#include <thread>

class SimpleSpinLock {
private:
    // std::atomic_flag 是 C++ 中保证无锁（lock-free）的原子类型
    // clear 表示未上锁，set 表示已上锁
    std::atomic_flag flag = ATOMIC_FLAG_INIT;

public:
    // 加锁
    void lock() {
        // test_and_set 返回之前的值：
        // 如果之前是 false，现在设为 true，跳出循环（获取锁成功）
        // 如果之前是 true，则继续循环（自旋等待）
        // std::memory_order_acquire 确保后续操作不会重排到加锁之前
        while (flag.test_and_set(std::memory_order_acquire)) {
            // 优化：告诉 CPU 这里在自旋，可以降低功耗或让出微小的执行资源
            std::this_thread::yield(); 
        }
    }

    // 释放锁
    void unlock() {
        // std::memory_order_release 确保之前的操作已经完成，不会重排到解锁之后
        flag.clear(std::memory_order_release);
    }

    // 尝试加锁
    bool try_lock() {
        return !flag.test_and_set(std::memory_order_acquire);
    }
};
```



该算法为每个线程维护一个布尔标志变量。为了获取锁，线程将其标志设置为`true`并等待直到其他的线程标志为`false`。线程通过将其标志重置为`false`来释放该锁。

> $write_A(x=v)$表示线程A将值v赋给字段x的事件
>
> $read_A(x==v)$表示A从字段x读取v的事件
>
> 

> 在真正的实践中，布尔标志变量以及后续算法中的受害者变量和标签变量，都必须声明为`violatile`才能正常工作。(第三章和附录B会详细进行解释)

上述算法中会存在一个循环：
$$
write_A(flag[A]=true)\rightarrow read_A(flag[B]==false)\rightarrow write_B(flag[B]=true)\rightarrow read_B(flag[A]==false)\rightarrow write_A(flag[A]=true)
$$

#### 双锁算法

```c++
#include <mutex>
#include <memory>

template <typename T>
class TwoLockQueue {
private:
    struct Node {
        T data;
        std::unique_ptr<Node> next;
        Node(T val) : data(std::move(val)), next(nullptr) {}
        Node() : next(nullptr) {} // 哨兵节点用
    };

    std::unique_ptr<Node> head; // 指向哨兵节点
    Node* tail;                 // 指向最后一个节点
    
    std::mutex head_mtx;        // 出队锁
    std::mutex tail_mtx;        // 入队锁

public:
    TwoLockQueue() {
        // 初始化时创建一个“哑节点/哨兵节点”，让 head 和 tail 不为空
        auto dummy = std::make_unique<Node>();
        tail = dummy.get();
        head = std::move(dummy);
    }

    // 入队：只锁尾部
    void enqueue(T value) {
        auto newNode = std::make_unique<Node>(std::move(value));
        Node* p = newNode.get();
        
        {
            std::lock_guard<std::mutex> lock(tail_mtx);
            tail->next = std::move(newNode);
            tail = p;
        }
    }

    // 出队：只锁头部
    bool dequeue(T& result) {
        std::lock_guard<std::mutex> lock(head_mtx);
        
        Node* first = head.get();
        Node* nextNode = first->next.get();
        
        if (nextNode == nullptr) {
            return false; // 队列为空
        }
        
        result = std::move(nextNode->data);
        head = std::move(first->next); // 移除旧的哨兵，让 nextNode 成为新的哨兵
        return true;
    }
};
```

双锁算法是不够的，因为在很多情况下会卡住除非线程并发运行。当然，该算法并不是毫无用处：如果线程并发运行，`lock()`方法会成功，单锁和双锁类互为补充——每一种在导致一种卡住的情况下尝试另一种会成功

### Peterson锁

这里我们将这两个结合起来，构造一个无饥饿的锁算法。

```c++
#include <iostream>
#include <vector>
#include <atomic>
#include <thread>

class PetersonLock {
private:
    // flag[0] 和 flag[1] 分别表示两个线程是否想进入临界区
    std::atomic<bool> flag[2];
    // turn 表示轮到哪个线程
    std::atomic<int> turn;

public:
    PetersonLock() {
        flag[0] = false;
        flag[1] = false;
        turn = 0;
    }

    // threadId 只能是 0 或 1
    void lock(int id) {
        int other = 1 - id;
        
        flag[id].store(true, std::memory_order_seq_cst); // 1. 我想进
        turn.store(other, std::memory_order_seq_cst);   // 2. 但我先让你进 (谦让)

        // 3. 自旋等待：
        // 只有当 对方想进(flag[other]==true) 且 确实轮到对方(turn==other) 时，我才等待
        while (flag[other].load(std::memory_order_seq_cst) && 
               turn.load(std::memory_order_seq_cst) == other) {
            std::this_thread::yield();
        }
    }

    void unlock(int id) {
        // 释放锁：我不想进了
        flag[id].store(false, std::memory_order_seq_cst);
    }
};

// --- 测试代码 ---

int g_counter = 0;
PetersonLock p_lock;

void worker(int id) {
    for (int i = 0; i < 10000; ++i) {
        p_lock.lock(id);
        g_counter++;
        p_lock.unlock(id);
    }
}

int main() {
    // Peterson 锁仅适用于 2 个线程
    std::thread t1(worker, 0);
    std::thread t2(worker, 1);

    t1.join();
    t2.join();

    std::cout << "Final Counter: " << g_counter << " (Expected: 20000)" << std::endl;
    return 0;
}
```

**引理**	Peterson锁算法满足互斥性

​	**假设** 	为了不失一般性，A是最后一个写入受害者字段的线程，即
$$
write_B(victim=B)\rightarrow write_A(victim=A)
$$
表明A观察到的受害者为A。由于A仍然进入了它的临界区，它必定观察到了`flag[B]`为假，因此我们有
$$
write_A(victim=A)\rightarrow read_A(flag[B]==false)
$$
将上式两个结合起来得到：
$$
write_B(flag[B]=true)\rightarrow write_B(victim=B)\rightarrow write_A(victim=A)\rightarrow read_A(flag[B]==false)
$$
这里结果表明$write_B(flag[B]=true)$与$read_A(flag[B]=false)$。这一观察结果导致矛盾，因为在临界区执行之前没有对`flag[B]`进行过其他写操作。

**引理**	Peterson锁算法是无饥饿的

反证法，假设并非如此，

### 死锁说明

尽管Peterson锁算法是无死锁的，但在使用多个Peterson锁的程序中，还可能出现另一种死锁——所有的资源被所有的线程所持有，刚刚好，当一个线程想要获取其他的资源时，会发现全部都在锁死，这样就达成了死锁。

文献中的死锁更多的用于描述代指系统进入一种线程无法继续进度的状态。单锁和双锁算法都容易受到这种死锁的影响。

这种更狭窄的死锁定义与活锁相互区别，在活锁中，两个或者多个线程通过采取破坏其他线程所采取的措施的步骤来积极地阻止彼此前进。当系统处于活锁而不是死锁状态时，有某种方法可以调度线程，以便系统能够前进。

考虑图中的活锁算法，如果两个线程都执行`lock()`方法，它们可能会无限期地重复以下步骤：

- 将各自的标志设置为`true`
- 检查另一个线程标志为`true`
- 将各自的标志变量设置为`false`
- 检查另一个线程的标志为`false`

由于可能存在这种活锁，活锁根据我们的定义并不是无死锁的。

然而，活锁并非按照狭义的定义发生死锁，因为总有一种方法可以调度线程，使得其中之一能够取得进展。

### 过滤锁

```c++
#include <iostream>
#include <vector>
#include <atomic>
#include <thread>

/**
 * Filter Lock 实现 (针对 N 个线程)
 */
class FilterLock {
private:
    int numThreads;
    // level[i] 表示线程 i 当前所在的层级
    std::vector<std::atomic<int>> level;
    // victim[L] 表示进入第 L 层时被“牺牲”的线程 ID
    std::vector<std::atomic<int>> victim;

public:
    FilterLock(int n) : numThreads(n), level(n), victim(n) {
        for (int i = 0; i < n; ++i) {
            level[i] = 0;
            victim[i] = 0;
        }
    }

    // 注意：过滤锁需要明确知道当前线程的 ID (0 到 n-1)
    void lock(int threadId) {
        // 线程需要通过 n-1 层过滤
        for (int L = 1; L < numThreads; ++L) {
            level[threadId] = L;       // 线程进入第 L 层
            victim[L] = threadId;     // 线程成为该层的被牺牲者

            // 等待条件：
            // 1. 存在其他线程 k 处于更高的层级 (level[k] >= L)
            // 2. 且当前线程依然是该层的被牺牲者 (victim[L] == threadId)
            bool keepWait = true;
            while (keepWait) {
                keepWait = false;
                if (victim[L] == threadId) {
                    for (int k = 0; k < numThreads; ++k) {
                        if (k != threadId && level[k] >= L) {
                            keepWait = true;
                            break;
                        }
                    }
                }
                if (keepWait) {
                    std::this_thread::yield(); // 优化：减少 CPU 空转消耗
                }
            }
        }
    }

    void unlock(int threadId) {
        // 将层级重置为 0，允许其他在底层等待的线程向上爬
        level[threadId] = 0;
    }
};

// --- 测试代码 ---

int g_counter = 0;
const int THREAD_COUNT = 5;
const int ITERATIONS = 1000;
FilterLock filterLock(THREAD_COUNT);

void worker(int id) {
    for (int i = 0; i < ITERATIONS; ++i) {
        filterLock.lock(id);
        g_counter++; // 临界区
        filterLock.unlock(id);
    }
}

int main() {
    std::vector<std::thread> threads;
    for (int i = 0; i < THREAD_COUNT; ++i) {
        threads.emplace_back(worker, i);
    }

    for (auto& t : threads) {
        t.join();
    }

    std::cout << "线程数: " << THREAD_COUNT << std::endl;
    std::cout << "预期结果: " << THREAD_COUNT * ITERATIONS << std::endl;
    std::cout << "实际结果: " << g_counter << std::endl;

    return 0;
}
```



过滤器锁——即将Peterson锁推广适用到`n>2`的线程。它创建了`n-1`个“等待室”，称为级别，线程必须遍历这些级别才能获取到锁。级别需要满足以下两个重要的属性：

1. 至少有一个线程尝试进入级别$l$成功
2. 如果多个线程尝试进入级别$l$，则至少有一个被阻塞。

Peterson锁使用一个包含两个元素的布尔标志来指示一个线程是否正在进入临界区。而过滤锁将这一概念推广到使用一个n元素的整数级别的数组，其中级别`[A]`的值表示线程`A`试图进入到最高级别。每个线程必须通过n-1个"排斥"级别才能进入其临界区。每个级别$l$都有一个独特的受害者字段，用于“过滤掉”一个线程，将其排除在该级别之外。除非没有线程在该级别或者更高级别。

**引理**	*对于$j$在$0$和$n-1$之间，最多$n-j$个线程已经进入级别j(并且没有随后退出临界区)*

这里的证明很简单，因为前面只有n-j-1  个空位，当占满之后再进入一个即n-j+1个进入级别中，多的无法再进入、

**推论**	*过滤器锁算法满足互斥*

**引理**	过滤器算法是无饥饿的

**推论**	过滤器算法是无死锁的（引理证明的小证明会证明无死锁）

### 公平性

无饥饿特性保证了每个调用`lock()`的线程最终都会进入临界区，但它不保证这需要多长时间，也不保证锁对试图获取它的线程是“公平“的。

如何定义“公平性”？

将锁方法分为一个入口部分和一个等待部分，其中入口部分总是在有限的步骤数内完成。也就是说，在调用`lock()`之后，一个线程在完成入口部分之前可以执行的步骤数有一个固定的上限。

**在一个保证有限步骤内完成的代码片段被称之为有界无等待**。有界无等待的特性是一个强烈的进展要求——没有循环的代码能满足这种特性。(当然有循环也可以通过特定的实现方式来拥有该特性)

**定义**	一个锁是先来先服务式的，如果它的`lock()`方法可以拆分成一个有界无等待的入口部分，然后是一个等待部分，使得当线程A完成它的入口之前，线程B开始它的入口之前，A不会被B超越。
$$
if \quad D_A^j \rightarrow D_B^k \quad then \quad CS_A^j \rightarrow CS_B^k
$$
对于任何线程A和B以及整数j和k，其中$D_A^j$和$CS_A^j$分别是A执行其j次调用`lock()`方法的入口部分和其j次临界区的区间。

> 请注意，任何既是死锁免疫又是先来服务的对于饥饿也是免疫的。

### Lamport 的Bakery锁算法

对于n线程的互斥问题最优雅的解决方案是Bakery锁算法——通过使用摇号机来发号保证先服务的特性

在Bakery锁中，`flag[A]`是一个布尔标志，指示A是否想进入临界区，而`label[A]`是一个整数，指示线程在进入Bakery时的相对顺序，对于每个线程A。为了获取锁，线程首先将其标志置位，然后通过读取所有线程的标签并生成一个大于所有其读取的新标签来选择一个新标签

从`lock()`方法的调用到写入新标签的代码作为入口：它确定了该线程相对于其他试图获取锁的线程的顺序。并发执行其入口的线程可能会读取相同的标签并选择相同的新标签。
$$
((label[i],i)<<(label[j],j())\\
if \ and \ only \ if \\
label[i]<label0[j] \ or \ label[i]==label[j] \  and \  i<j
$$
自释放锁不会重置`label[]`，因此很容易看出每个线程的标签保持严格的递增。

*有趣的是，在入口和等待部分，线程异步并且以任意顺序读取标签*

**引理**	Bakery锁算法是无死锁的。

**推论**	Bakery锁算法是无饥饿的

**引理**	Bakery锁算法满足互斥

上述引理和推论可以推出Bakery算法满足互斥

### 有界时间戳

这里有一个很重要的点：**Bakery锁中的标签会无限增长，因此在一个长期运行的系统中，我们可能需要担心溢出问题**。

如果某个线程的标签字段从大数字静默地回绕到0，那么先来服务的属性将不成立。

在后面的章节中，我们讨论如何使用计数器对线程进行排序，甚至产生唯一ID的构造。

在Bakery锁中，标签充当时间戳：*它们为争用线程建立顺序。非正式地说，我们需要确保如果一个线程在另一个线程之后获取标签，那后者拥有更大的标签*。

一个线程需要两种能力：

- 读取其他线程地时间戳(扫描)
- 给自己分配一个更晚的时间戳(标记)

构造一个顺序时间戳系统，其中线程依次执行扫描和标记操作，也就是说，
