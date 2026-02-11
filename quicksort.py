def quicksort(arr):
    """
    快速排序算法实现
    
    参数:
        arr: 待排序的列表
    
    返回:
        排序后的列表
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)


def quicksort_inplace(arr, low=0, high=None):
    """
    原地快速排序算法实现
    
    参数:
        arr: 待排序的列表
        low: 起始索引
        high: 结束索引
    """
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pivot_index = partition(arr, low, high)
        quicksort_inplace(arr, low, pivot_index - 1)
        quicksort_inplace(arr, pivot_index + 1, high)


def partition(arr, low, high):
    """
    分区函数，将数组分为小于和大于基准值的两部分
    
    参数:
        arr: 数组
        low: 起始索引
        high: 结束索引
    
    返回:
        基准值的最终位置
    """
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1


if __name__ == "__main__":
    test_array = [64, 34, 25, 12, 22, 11, 90, 88, 76, 50, 42]
    print(f"原数组: {test_array}")
    
    sorted_array = quicksort(test_array.copy())
    print(f"排序后 (新数组): {sorted_array}")
    
    inplace_array = test_array.copy()
    quicksort_inplace(inplace_array)
    print(f"排序后 (原地): {inplace_array}")
    
    print(f"验证排序正确性: {sorted_array == sorted(test_array)}")