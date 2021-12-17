const zapInitialState = () => ({
    toggle: false,

    id: null,
    error: {},

    available_scan_types: ['xss', 'sqli'],
    scan_types: [],

    auth_login: '',
    auth_password: '',
    auth_script: '',
    bind_all_interfaces: true,
    daemon_debug: false,
    java_options: '',
    passive_scan_wait_threshold: 0,
    passive_scan_wait_limit: 600,
})

const zapApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    data() {
        return {
            pluginName: 'security_scanner_zap',
            ...zapInitialState()
        }
    },
    mounted() {
        window[`scanners_${this.pluginName}`] = {
            get_data: () => this.toggle && this.body_data,
            set_data: this.loadSettings,
            clear_data: this.clear,
        }
        this.handleIntegrationSelect({target: this.zap_selectpicker})
    },
    computed: {
        zap_selectpicker() {
            return $(`#selector_${this.pluginName} .selectpicker`)
        },
        body_data() {
            const {
                description,
                is_default,
                id,

                scan_types,
                auth_login,
                auth_password,
                auth_script,
                bind_all_interfaces,
                daemon_debug,
                java_options,
                passive_scan_wait_threshold,
                passive_scan_wait_limit,
            } = this
            return {
                description,
                is_default,
                id,

                scan_types,
                auth_login,
                auth_password,
                auth_script,
                bind_all_interfaces,
                daemon_debug,
                java_options,
                passive_scan_wait_threshold,
                passive_scan_wait_limit,
            }
        },
        scan_types_indeterminate() {
            return !(this.scan_types.length === 0 || this.scan_types.length === this.available_scan_types.length)
        }
    },
    watch: {
        toggle(newState, oldState) {
            $(`#selector_${this.pluginName}`).collapse(~~newState ? 'show' : 'hide')
        },
    },
    methods: {
        handle_select_all(e) {
            if (this.scan_types_indeterminate || !e.target.checked) {
                this.scan_types = []
                e.target.checked = false
            } else {
                this.scan_types = [...this.available_scan_types]
            }
        },
        clear() {
            this.zap_selectpicker[0]?.options.forEach(item =>
                item.dataset.is_default && this.zap_selectpicker.val(item.value).selectpicker('refresh')
            )
            this.handleIntegrationSelect({target: this.zap_selectpicker})
            this.toggle = false
            $(`#settings_${this.pluginName}`).collapse('hide')

        },
        loadIntegration(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData,
            })
        },
        loadSettings(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData,
                toggle: true
            })
            this.zap_selectpicker.val(stateData.id)
            this.zap_selectpicker.selectpicker && this.zap_selectpicker.selectpicker('refresh')
        },
        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        console.log(errorData)
                        errorData.forEach(item => {
                            console.log('item error', item)
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertCreateTest.add(e, 'danger-overlay')
            }
        },
        handleScanTypeCheck(value, checked) {
            if (checked) {
                this.scan_types.push(value)
            } else {
                const i = this.scan_types.indexOf(value)
                this.scan_types.splice(i, 1)
            }
        },
        handleIntegrationSelect(e, doToggle = true) {
            const target = $(e.target)
            const {id, description, settings} = JSON.parse(
                target.find(`option[value=${target.val()}]`)[0].dataset.data
            )
            this.loadIntegration({id, description, ...settings})
        }
    }
})

zapApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13', 'h7'].includes(tag)
const zapVm = zapApp.mount('#security_scanner_zap')
