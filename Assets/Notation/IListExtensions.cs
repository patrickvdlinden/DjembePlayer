using System;
using System.Collections.Generic;

namespace Notation
{
    public static class IListExtensions
    {
        public static int FindIndex<T>(this IList<T> list, Predicate<T> match)
        {
            return FindIndex(list, 0, list.Count, match);
        }

        public static int FindIndex<T>(this IList<T> list, int startIndex, Predicate<T> match)
        {
            return FindIndex(list, startIndex, list.Count - startIndex, match);
        }

        public static int FindIndex<T>(this IList<T> list, int startIndex, int count, Predicate<T> match)
        {
            if ((uint)startIndex > (uint)list.Count)
            {
                throw new ArgumentOutOfRangeException(nameof(startIndex));
            }

            if (count < 0 || startIndex > list.Count - count)
            {
                throw new ArgumentOutOfRangeException(nameof(count));
            }

            if (match == null)
            {
                throw new ArgumentNullException(nameof(match));
            }

            var endIndex = startIndex + count;
            for (var i = startIndex; i < endIndex; i++)
            {
                if (match(list[i]))
                {
                    return i;
                }
            }

            return -1;
        }
    }
}
