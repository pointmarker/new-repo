window.onload = async() => {

    const params = new URLSearchParams(window.location.search)
    
    const res = await fetch('/api/todos',{
        method: 'GET'
    })

    if(!res.ok) throw new Error('error occured on fetching all tasks');

    const {page, limit, sortBy, totalTaskCount, totalPageCount, data} = await res.json()

    /**
     * 
     * having pages nav bar logic
     */
    function havingPagesNavLogic(){
        const tableEl = document.getElementById('pages-navigation')
        let tdEl = document.createElement('td')

        tdEl.textContent = 1
        tableEl.appendChild(tdEl)
        
        if(page <= 3){
            for(let i = 2; i<= Math.min(9 ,totalPageCount -1); i++){
                tdEl.textContent = i
                tableEl.appendChild(tdEl)
            }
        }else if((totalPageCount - 6) > page){
            for(let i = page - 1; i < page + 7;i++){
                tdEl.textContent = i;
                tableEl.appendChild(tdEl)
            }
        }else if((totalPageCount - 6) < page){
            for(let i = totalPageCount - 8; i < totalPageCount; i++){
                tdEl.textContent = i;
                tableEl.appendChild(tdEl)
            }
        }

        tdEl.textContent = totalPageCount;
        tableEl.appendChild(tdEl)

        const allTdEls = tableEl.querySelectorAll('td')
        allTdEls.forEach(td => {
            tdEl.addEventListener("click", (e) => {
                const pageNumber = parseInt(e.target.textContent)
                if(pageNumber){
                    window.location.href = `/todos?page=${pageNumber}&limit=${limit}&sortBy=${sortBy}`
                }
            })
        })
    }

    havingPagesNavLogic()

     /**
     * 
     */

    const limitSelect = document.getElementById('limit-selections')
    limitSelect.value = limit

    limitSelect.addEventListener('change', (e) => {

        const targetLimit = parseInt(e.target.value)
        const pageNumber = parseInt(page)

        window.location.href = `/todos?page=${pageNumber}&limit=${targetLimit}&sortBy=${sortBy}`
    })

    /**
     * 
     * creating a tasks container
     */


    // adding task count info to page

    const taskCountContainer = document.getElementById('task-count-container')
    const pEl = document.createElement('p')
    pEl.textContent = totalTaskCount
    taskCountContainer.appendChild(pEl)

    // visualizating tasks

    const sortingSelectEl = document.getElementById('sorting-select')
    sortingSelectEl.value = sortBy

    sortingSelectEl.addEventListener('change',(e) => {
        const sortingValue = e.target.textContent
        window.location.href = `/todos?page=${page}&limit=${limit}&sortBy=${sortingValue}`
    })


    for(let i = 0; i < limit ; i++){
        const task = 
    }


    /**
     * 
     * 
     */
}


